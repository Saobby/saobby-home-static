#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重写页面 vs 旧页面 ——「真实渲染布局差异」检查工具

原理
----
1. 从 git 历史里取出某个页面被删除前的旧 index.html（删除提交的父提交）；
2. 把 `v2/dist` 里的构建产物按 CI 的方式摊平（模拟部署），作为「新页面」；
3. 两者放进同一个 http 根目录（/legacy/<page>/ 与 /new/<page>/），旧页面要的 `/static`、
   新页面要的 `/assets` 也一起提供；
4. 用 headless Chrome 打开 `probe.html`：它把新旧页面放进两个同源 iframe，等渲染稳定后
   量出每个可见元素的 rect / 外边距 / 字号，以及**每个父元素里相邻子元素之间的水平/垂直间距**，
   两边按 key 配对做 diff，把结果写进 DOM；
5. `chrome --dump-dom` 把结果拿回来，解析并打印报告。

为了让结果稳定、离线，Chrome 用 `--host-resolver-rules="MAP * ~NOTFOUND"`：
页面里所有外部请求（API、CDN）都会立刻失败，新旧页面都停在同样的加载/错误态，
这样量到的差异只反映「布局/样式」而不是数据。

用法
----
    cd <repo>
    (cd v2 && npm run build)                       # 需要先有 v2/dist
    python3 tools/layout-diff/layout_diff.py       # 默认检查所有已迁移页面
    python3 tools/layout-diff/layout_diff.py --pages my_webcounters webcounter_dashboard
    python3 tools/layout-diff/layout_diff.py --tol 2 --width 400     # 更严格 / 窄屏
    python3 tools/layout-diff/layout_diff.py --keep                  # 保留临时目录，便于排查
"""
import argparse
import html
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import quote

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
V2 = os.path.join(REPO, "v2")
DIST = os.path.join(V2, "dist")
PROBE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "probe.html")

# 页面名 -> 旧页面文件路径（默认 <page>/index.html；首页特殊）
LEGACY_PATH = {
    "home": "index.html",
}
# 页面名 -> 需要「已登录」态（带上假的 access_token）
NEED_TOKEN = {"my_webcounters", "webcounter_dashboard", "user_config", "set_avatar", "bind_email", "notifications", "create_post"}
# 每个页面的「交互状态」：一个状态 = 一串步骤（默认的「什么都不点」状态会自动先跑一遍）。
# 步骤语法见 probe.html：click:<css> / type:<css>=<值> / select:<css>=<值>
#   步骤可以带 "@<毫秒>" 后缀改「这一步之后等多久」；步骤 settle:<毫秒> 改「测量前的等待」
STATES = {
    "login": [
        ["type:input[placeholder=用户名]=probe-user", "type:input[placeholder=密码]=probe-pass", "click:button"],
    ],
    "register": [
        ["click:button"],                                   # 空表单提交 → 校验/报错提示
    ],
    "my_webcounters": [
        ["click:.wux-btn-group button:nth-child(2)"],        # 翻到第 2 页
        ["type:input[placeholder=搜索 ID 或备注]=probe", "click:button"],
    ],
    "posts": [
        ["click:.wux-btn-group button:nth-child(2)"],
    ],
    "notifications": [
        ["click:.wux-btn-group button:nth-child(2)"],
    ],
    "webcounter_dashboard": [
        ["click:#tab-log-query"],
        ["click:#tab-log-query", "click:#log-auto-refresh"],  # 自动刷新勾选 + 再收集一次
        ["click:#tab-settings"],
        ["select:#time-range-select=2592000"],                # 数据总览换时间段
    ],
    "user_config": [
        ["click:#tab-bind-email"],
        ["click:#tab-set-avatar"],
    ],
    "create_post": [
        ["click:button.simple"],                             # 预览/编辑切换
    ],
    "create_vote": [
        ["click:button.label"],                              # 添加一个选项
    ],
    "upload_file": [
        ["click:button"],                                    # 未选文件就上传 → 提示
        # 点第一个复制按钮 → 按钮禁用、文案变「OK!」（只停 1 秒，所以测量前的等待要调小）
        ["click:button:nth-of-type(2)@20", "settle:80"],
    ],
    "bvdlp": [
        ["click:button"],                                    # 空链接解析 → 错误态
    ],
}


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def list_pages():
    pages = []
    root = os.path.join(V2, "src", "pages")
    for name in sorted(os.listdir(root)):
        if os.path.isfile(os.path.join(root, name, "index.html")):
            pages.append(name)
    return pages


def file_source(path):
    """返回 (rev_or_None, path)。rev=None 表示直接用工作区文件；否则用 git 里的版本。"""
    in_head = subprocess.run(
        ["git", "-C", REPO, "cat-file", "-e", "HEAD:%s" % path],
        capture_output=True
    ).returncode == 0
    if in_head:
        return "HEAD", path
    res = subprocess.run(
        ["git", "-C", REPO, "log", "--diff-filter=D", "--format=%H", "--", path],
        capture_output=True, text=True
    )
    revs = [line.strip() for line in res.stdout.splitlines() if line.strip()]
    if not revs:
        return None, path
    return "%s^" % revs[0], path


def legacy_source(page):
    return file_source(LEGACY_PATH.get(page, "%s/index.html" % page))


STATIC_REF_RE = re.compile(r"/static/[A-Za-z0-9._\-/]+")


def stage_legacy_assets(root, page):
    """旧页面运行时用到的 /static 资源可能已经从工作区删掉了（迁移时清理过），这里从 git 补全，
    否则旧页面会停在加载态、没法比。BFS 顺着引用链补齐（页面 HTML → 它的 JS → JS 里再引用的 echarts/地图数据…）。"""
    queue = [os.path.join(root, "legacy", page, "index.html")]
    seen = set()
    while queue:
        target = queue.pop(0)
        try:
            with open(target, encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except OSError:
            continue
        for ref in STATIC_REF_RE.findall(text):
            dst = os.path.join(root, ref.lstrip("/"))
            if not os.path.exists(dst):
                rev, path = file_source(ref.lstrip("/"))
                if not rev:
                    continue
                try:
                    content = run(["git", "-C", REPO, "show", "%s:%s" % (rev, path)]).stdout
                except subprocess.CalledProcessError:
                    continue
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                with open(dst, "w", encoding="utf-8") as f:
                    f.write(content)
            if dst not in seen and ref.endswith((".js", ".html")):
                seen.add(dst)
                queue.append(dst)


# 页面里会出现的后端域名：改写成本地服务器，这样「已加载」的界面也能比，
# 而且新旧页面拿到的是同一份 mock 数据
API_HOSTS = [
    "w.saobby.com", "comments.saobby.com", "captcha-v3.saobby.com", "vote.saobby.com",
    "connector.saobby.com", "birthdaystar.saobby.com", "midishow-vc-fast.saobby.com",
    "www.saobby.com", "rumt-zh.com",
]


def api_fixtures(empty=False):
    counters = [] if empty else [{
        "counter_id": "probe%02d" % i,
        "access_token": "probe-token-%02d" % i,
        "desc": "示例计数器 %d" % i,
        "create_at": 1700000000 + i * 86400,
        "pic_type": i % 2,
        "display_type": i % 3,
    } for i in range(1, 9)]
    log = {
        "timestamp": 1700000000, "ip": "203.0.113.7", "browser": "Chrome", "device": "Desktop",
        "os": "Windows", "country": "中国", "province": "广东", "city": "深圳",
        "isp": "China Telecom", "is_mobile_ip": False, "is_proxy_ip": False, "is_hosting_ip": False,
        "referer": "https://example.com/", "user_agent": "Mozilla/5.0 (probe)",
    }
    logs = [] if empty else [dict(log) for _ in range(3)]
    days = ["10-0%d" % d for d in range(1, 8)]
    return {
        "/api/get_users_counter": {"success": True, "data": {
            "counters": counters, "page_index": 0, "page_amount": 0 if empty else 3}},
        "/api/get_counter_settings": {"success": True, "data": {"settings": {
            "counter_id": "probe01", "access_token": "probe-token", "pic_type": 1, "display_type": 0,
            "font_size": 16, "text_color": "#000000", "background_color": "#ffffff",
            "desc": "" if empty else "示例备注",
        }}},
        "/api/verify_access_token": {"success": True, "data": {}},
        "/api/get_overall_data": {"success": True, "data": {
            "total_visits": 0 if empty else 12345, "total_ips": 0 if empty else 678,
            "today_visits": 0 if empty else 89, "today_ips": 0 if empty else 45,
            "yesterday_visits": 0 if empty else 76, "yesterday_ips": 0 if empty else 40,
        }},
        "/api/get_trend_data": {"success": True, "data": {"trend": {
            "dates": [] if empty else days,
            "visits": [] if empty else [1, 2, 3, 4, 5, 6, 7],
            "ips": [] if empty else [1, 1, 2, 2, 3, 3, 4],
        }}},
        "/api/get_heatmap_data": {"success": True, "data": {
            "visits": {} if empty else {"CN": 10, "US": 5, "JP": 2},
            "ips": {} if empty else {"CN": 6, "US": 3, "JP": 1},
        }},
        "/api/get_log": {"success": True, "data": {"logs": logs, "page_amount": 0 if empty else 2}},
    }


class MockHandler(SimpleHTTPRequestHandler):
    """静态文件 + /api/* 返回固定数据（新旧页面拿到同一份，才能比「已加载」的布局）。"""

    fixtures = {}

    def log_message(self, *args, **kwargs):   # 安静点
        return

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _route(self, path, payload):
        if path == "/api/get_top":
            kind = payload.get("type", 0)
            if kind == 0:
                return {"success": True, "data": {"visits": [i for i in range(24)], "ips": [i % 5 for i in range(24)]}}
            key = {1: "Chrome", 2: "Desktop", 3: "Windows"}.get(kind, "Other")
            return {"success": True, "data": {"visits": {key: 10, "Other": 2}, "ips": {key: 6, "Other": 1}}}
        return self.fixtures.get(path, {"success": False, "message": "layout-probe: 未 mock 的接口 %s" % path})

    def do_POST(self):  # noqa: N802
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""
        path = self.path.split("?")[0]
        if not path.startswith("/api/"):
            return self.send_error(404)
        try:
            payload = json.loads(raw.decode("utf-8") or "{}")
        except ValueError:
            payload = {}
        return self._json(self._route(path, payload))

    def do_GET(self):  # noqa: N802
        path = self.path.split("?")[0]
        if path.startswith("/api/"):
            return self._json(self._route(path, {}))
        return super().do_GET()


def rewrite_urls(root, base, hosts):
    """把页面里出现的后端域名改写成本地地址（mock 模式）。"""
    for dirpath, _dirnames, filenames in os.walk(root):
        for name in filenames:
            if not name.endswith((".js", ".html", ".json")):
                continue
            path = os.path.join(dirpath, name)
            try:
                with open(path, encoding="utf-8") as f:
                    text = f.read()
            except (UnicodeDecodeError, OSError):
                continue
            new = text
            for host in hosts:
                new = new.replace("https://" + host, base).replace("http://" + host, base)
            if new != text:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)

def stage_two_builds(root, baseline_dist):
    """自比对模式：把「改动前」的构建产物放到 /buildA/、当前构建放到 /buildB/，
    用来直接回答「这次全局改动有没有改动已调好的 v2 页面」。"""
    for tag, src in (("buildA", baseline_dist), ("buildB", DIST)):
        dst = os.path.join(root, tag)
        os.makedirs(dst, exist_ok=True)
        shutil.copytree(os.path.join(src, "assets"), os.path.join(dst, "assets"))
        pages_src = os.path.join(src, "src", "pages")
        for name in os.listdir(pages_src):
            page_dir = os.path.join(pages_src, name)
            if os.path.isdir(page_dir):
                shutil.copytree(page_dir, os.path.join(dst, name))
        # 两套构建的 hash 资源互不干扰：把 /assets/ 改成 /<tag>/assets/
        for dirpath, _dirnames, filenames in os.walk(dst):
            for name in filenames:
                if not name.endswith((".html", ".js", ".css")):
                    continue
                path = os.path.join(dirpath, name)
                try:
                    with open(path, encoding="utf-8", errors="ignore") as f:
                        text = f.read()
                except OSError:
                    continue
                if "/assets/" in text:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(text.replace("/assets/", "/%s/assets/" % tag))


def stage_tree(tmp, base_url=None):
    """把新旧页面、静态资源都铺到一个 http 根目录里；mock 模式下顺便把后端域名改写成本地地址。"""
    root = os.path.join(tmp, "root")
    os.makedirs(root)
    # 旧页面要的 /static：js/css/font 要复制（因为要改里面的域名），其余（图片等）软链过来就够
    static_root = os.path.join(root, "static")
    os.makedirs(static_root)
    for name in os.listdir(os.path.join(REPO, "static")):
        src = os.path.join(REPO, "static", name)
        dst = os.path.join(static_root, name)
        if name in ("js", "css", "font"):
            shutil.copytree(src, dst)
        else:
            os.symlink(src, dst)
    # 新页面要的 /assets
    shutil.copytree(os.path.join(DIST, "assets"), os.path.join(root, "assets"))
    # 摊平新页面：dist/src/pages/<page>/ -> /new/<page>/
    pages_src = os.path.join(DIST, "src", "pages")
    for name in os.listdir(pages_src):
        src = os.path.join(pages_src, name)
        if os.path.isdir(src):
            shutil.copytree(src, os.path.join(root, "new", name))
    os.makedirs(os.path.join(root, "legacy"), exist_ok=True)
    shutil.copy(PROBE, os.path.join(root, "probe.html"))
    if base_url:
        rewrite_urls(root, base_url, API_HOSTS)
    return root


def stage_legacy(root, page):
    rev, path = legacy_source(page)
    dst = os.path.join(root, "legacy", page)
    os.makedirs(dst, exist_ok=True)
    if rev:
        content = run(["git", "-C", REPO, "show", "%s:%s" % (rev, path)]).stdout
    else:
        local = os.path.join(REPO, path)
        if not os.path.isfile(local):
            # 这个页面本来就不是「旧页面重写」来的（例如 v2 新增的音乐相关页面），没有可对比的基线
            return None
        with open(local, encoding="utf-8") as f:
            content = f.read()
    with open(os.path.join(dst, "index.html"), "w", encoding="utf-8") as f:
        f.write(content)
    return rev or "工作区"


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def serve(root, port, mock=True, empty=False):
    MockHandler.fixtures = api_fixtures(empty=empty) if mock else {}
    httpd = ThreadingHTTPServer(("127.0.0.1", port), partial(MockHandler, directory=root))
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


def find_chrome():
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        path = shutil.which(name)
        if path:
            return path
    raise SystemExit("找不到 Chrome/Chromium（本工具需要它做真实渲染）")


def dump_probe(chrome, url, profile, port, timeout=120):
    cmd = [
        chrome, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
        "--no-first-run", "--disable-extensions", "--disable-dev-shm-usage",
        "--user-data-dir=%s" % profile,
        # 把所有外部域名都解析到本地这个静态服务器：外部 API/CDN 一定失败（两边一致），
        # 而页面自己的 /static、/assets 请求照常由本地服务器提供
        "--host-resolver-rules=MAP * 127.0.0.1:%d" % port,
        "--window-size=1400,900",
        "--virtual-time-budget=20000",
        "--dump-dom", url,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    matched = re.search(r'<pre id="out">(.*?)</pre>', res.stdout, re.S)
    if not matched:
        return {"status": "error", "message": "探针没有输出（chrome 出错？）", "stderr": (res.stderr or "")[-400:]}
    try:
        return json.loads(html.unescape(matched.group(1)))
    except Exception as err:  # noqa: BLE001
        return {"status": "error", "message": "无法解析探针输出: %s" % err, "raw": matched.group(1)[:400]}


def report(page, legacy_rev, res, top):
    print("=" * 110)
    print("页面 %-22s 旧页面来源: %s" % (page, legacy_rev))
    if res.get("status") != "done":
        print("  ✗ 探针失败: %s" % res.get("message"))
        if res.get("stderr"):
            print("    stderr: %s" % res["stderr"])
        return 1
    counts = res["counts"]
    problems = sum(counts.values())
    print("  元素数 旧=%d 新=%d ；相邻元素间距对数 旧=%d 新=%d"
          % (res["old_el_count"], res["new_el_count"], res["old_gap_count"], res["new_gap_count"]))
    print("  差异总数 %d → 缺失元素 %d，多出元素 %d，位置/尺寸 %d，间距 %d，样式 %d"
          % (problems, counts["missing"], counts["extra"], counts["rect"], counts["gap"], counts["style"]))
    if res["gap"]:
        print("  --- 间距差异（旧 → 新，正值=新版更大）---")
        for gap in res["gap"][:top]:
            delta = gap["diff"] if gap["diff"] is not None else 0.0
            print("   [%s] Δ%+7.1f  %6.1f → %6.1f   %s ⟶ %s"
                  % (gap["dir"], delta, gap["old"], gap["now"], gap["a"][:38], gap["b"][:38]))
    if res["rect"]:
        print("  --- 位置/尺寸差异 ---")
        for item in res["rect"][:top]:
            print("   Δx%+7.1f Δy%+7.1f Δw%+7.1f Δh%+7.1f   %s | %s"
                  % (item["dx"], item["dy"], item["dw"], item["dh"], item["key"][:52], item["text"][:26]))
    if res["missing"]:
        print("  --- 旧页面有、新页面没有 ---")
        for item in res["missing"][:8]:
            print("   %s | %s" % (item["key"][:60], item["text"][:30]))
    if res["extra"]:
        print("  --- 新页面多出来的 ---")
        for item in res["extra"][:8]:
            print("   %s | %s" % (item["key"][:60], item["text"][:30]))
    if res["style"]:
        print("  --- 样式差异（margin-top|margin-bottom|margin-left|font-size|display）---")
        for item in res["style"][:8]:
            print("   %s\n     旧 %s\n     新 %s" % (item["key"][:60], item["old"], item["now"]))
    return problems


def main():
    parser = argparse.ArgumentParser(description="重写页面 vs 旧页面的真实渲染布局差异检查")
    parser.add_argument("--pages", nargs="*", default=None, help="要检查的页面（默认：v2/src/pages 下全部）")
    parser.add_argument("--tol", type=float, default=3.0, help="差异阈值（px），默认 3")
    parser.add_argument("--width", type=int, default=1200, help="iframe 宽度，默认 1200")
    parser.add_argument("--settle", type=int, default=1500, help="渲染稳定等待（ms），默认 1500")
    parser.add_argument("--top", type=int, default=20, help="每类最多打印多少条")
    parser.add_argument("--keep", action="store_true", help="保留临时目录")
    parser.add_argument("--no-mock", action="store_true", help="不使用 mock 接口（页面停在加载/错误态）")
    parser.add_argument("--empty", action="store_true", help="mock 返回空数据，用来测「空列表 / 无数据」状态")
    parser.add_argument("--baseline-dist", default=None,
                        help="自比对模式：拿这个目录里的「改动前」构建产物与当前 dist 对比，"
                             "用来判断一次全局改动是否改动了已调好的 v2 页面")
    parser.add_argument("--fail-over", type=int, default=None, help="差异总数超过该值就以非 0 退出")
    args = parser.parse_args()

    if not os.path.isdir(DIST):
        sys.exit("找不到 %s —— 请先在 v2 目录里跑 npm run build" % DIST)
    chrome = find_chrome()
    pages = args.pages or list_pages()

    tmp = tempfile.mkdtemp(prefix="layout-diff-")
    port = free_port()
    base_url = None if args.no_mock else "http://127.0.0.1:%d" % port
    if args.baseline_dist:
        root = os.path.join(tmp, "root")
        os.makedirs(root)
        shutil.copy(PROBE, os.path.join(root, "probe.html"))
        stage_two_builds(root, args.baseline_dist)
        if base_url:
            rewrite_urls(root, base_url, API_HOSTS)
    else:
        root = stage_tree(tmp, base_url)
    serve(root, port, mock=not args.no_mock, empty=args.empty)
    profile = os.path.join(tmp, "chrome-profile")
    os.makedirs(profile, exist_ok=True)

    self_compare = bool(args.baseline_dist)
    summary = {}
    errors = 0
    try:
        for page in pages:
            if self_compare:
                old_base, new_base = "/buildA", "/buildB"
                if not (os.path.isfile(os.path.join(root, "buildA", page, "index.html"))
                        and os.path.isfile(os.path.join(root, "buildB", page, "index.html"))):
                    print("跳过 %s：两套构建里缺这个页面" % page)
                    summary[page] = None
                    continue
                baseline_label = "v2 改动前（自比对）"
            else:
                old_base, new_base = "/legacy", "/new"
                if not os.path.isfile(os.path.join(root, "new", page, "index.html")):
                    print("跳过 %s：构建产物里没有这个页面" % page)
                    summary[page] = None
                    continue
                baseline_label = stage_legacy(root, page)
                if baseline_label is None:
                    print("跳过 %s：仓库里没有它的旧版本（不是从旧页面重写来的），没有可比对的基线" % page)
                    summary[page] = None
                    continue
                stage_legacy_assets(root, page)
                if base_url:
                    # 旧页面和它的 JS 是刚铺进来的，域名改写要再跑一遍
                    rewrite_urls(root, base_url, API_HOSTS)
            token = "layout-probe-token" if page in NEED_TOKEN else ""
            # 控制面板的密钥是从 URL 参数里取的（旧页面、新页面都是），两侧都带上；其余页面靠 probe 写好的 localStorage
            query = "?access_token=%s" % token if page == "webcounter_dashboard" else ""
            page_total = 0
            for steps in [[]] + STATES.get(page, []):
                url = ("http://127.0.0.1:%d/probe.html?old=%s/%s/%s&new=%s/%s/%s&tol=%s&width=%d&settle=%d%s"
                       % (port, old_base, page, query, new_base, page, query, args.tol, args.width, args.settle,
                          ("&token=" + token) if token else ""))
                if steps:
                    url += "&steps=" + quote(json.dumps(steps, ensure_ascii=False), safe="")
                label = page
                if steps:
                    label += " [%s]" % " → ".join(steps)
                if args.empty:
                    label += "（空数据）"
                print("检查 %s ..." % label, flush=True)
                res = dump_probe(chrome, url, profile, port)
                page_total += report(label, baseline_label, res, args.top)
                if res.get("status") != "done":
                    errors += 1
            summary[page] = page_total
    finally:
        if args.keep:
            print("\n临时目录（含 /legacy、/new 与 probe.html）：%s" % tmp)
        else:
            shutil.rmtree(tmp, ignore_errors=True)

    print("=" * 110)
    print("汇总：" + "，".join("%s=%s" % (k, v) for k, v in summary.items()))
    total = sum(v for v in summary.values() if v)
    if errors:
        print("有 %d 个页面探针执行失败" % errors)
        return 1
    if args.fail_over is not None and total > args.fail_over:
        print("差异总数 %d 超过阈值 %d" % (total, args.fail_over))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
