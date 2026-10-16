# saobby-home-static

[我的个人主页](https://www.saobby.com/) 的前端代码，欢迎提交 `Issue` 和 `PR`！

部署状态:  
![](https://api.netlify.com/api/v1/badges/966c764a-ecb5-4871-94e7-e4b5f2e3ae01/deploy-status)

> **PR 请提到 `development` 分支。** `production` 是 CI 强推出来的产物分支，源码推过去会被覆盖。
> 动手改 `v2/` 之前建议先读 [`AGENT.md`](./AGENT.md)：页面模板、图标对照表、踩过的坑、验证清单都在那里。

## 快速开始

```bash
cd v2
npm install
cp .env.production .env.development   # 见下
npm run dev
```

然后打开 `http://127.0.0.1:5173/src/pages/home/`。

三件事值得留意：

- **`v2/.env.development` 被 gitignore，克隆下来没有这个文件**。把 `.env.production` 复制一份，并把里面的
  `VITE_*_PAGE_URL` 改成 `/src/pages/<page>/`。dev server 按源码路径提供页面，所以直接开 `/` 是 404，不是 bug。
- `VITE_*_API_DOMAIN` 保持生产值即可（本地没有后端）。也就是说本地登录、发帖、上传**会真打到线上**，注意别乱点。
- 需要登录态的页面，可以在控制台 `localStorage.setItem('access-token', '...')` 自己塞一个。

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` / `build` / `preview` | 开发服务器（5173）/ 生产构建到 `v2/dist` / 预览产物（4173，路径同样是 `/src/pages/<page>/`） |
| `python3 -m http.server 8000` | 预览根目录下未迁移的旧页面（如 `/ccw/`），无需依赖 |
| `python3 server.py` | 同上，Flask 版本，端口 14515（先 `source .venv/bin/activate`） |
| `python3 tools/layout-diff/layout_diff.py` | 新旧页面的布局比对（需 Python 3 + Chrome），见下文 |

## 目录结构

```
/                        仓库根目录 = 站点根目录；根目录下的 <page>/ 是未迁移的旧页面
├── static/              旧页面共用的 css / js / 图片（新页面不要再用 static/js 里的脚本）
├── v2/                  新页面（Vue3 + Vite）
│   ├── src/pages/<page>/    每个目录一个页面：index.html + main.js + App.vue
│   ├── src/components/      跨页面共享组件
│   ├── src/assets/          工具模块与样式（util.js / captcha.js / darkMode.js / wux.css …）
│   └── .env.production      环境变量（页面 URL、服务域名）；.env.development 需自建
├── tools/layout-diff/   布局比对工具
├── AGENT.md             迁移/重写规范（必读）
└── 404.html / _headers / vercel.json / robots.txt / sitemap.xml    静态托管与 SEO 配置
```

仓库里新老两代页面并存：新页面在 `v2/`，旧页面是原生 HTML + 全局脚本，正在逐步迁移。
**页面目录名就是 URL**（`v2/src/pages/create_vote/` → `/create_vote/`），迁移时不能改名。

技术栈：Vue 3 + Vite 6（MPA 多入口，`@vitejs/plugin-legacy` 兼容旧浏览器）、Tabler、marked + katex + highlight.js、echarts、hls.js。

## 部署

`.github/workflows/build.yml`：push 到 `development` 后，CI 会用 Babel / terser / cssnano 处理旧静态资源、
构建 `v2`，然后把产物「摊平」到仓库根目录（`assets/`、每个页面目录、首页 `index.html`）强推给 `production`。

因此：

1. 新页面写完必须**删掉根目录下的旧页面目录和旧 JS**（`git rm -r <page>`、`git rm static/js/<page>.js`），
   否则产物会嵌进同名旧目录、变成 `create_vote/create_vote/index.html`，站点直接挂。删除前先 grep 确认没人引用。
2. 加了 npm 依赖要连 `v2/package-lock.json` 一起提交（CI 跑 `npm ci`）。
3. 产物会 `drop_console`，线上别指望看到 `console.log`。

## 页面

| 页面 | 说明 |
|---|---|
| `home`（`/`） | 首页：工具入口、联系方式、生日提醒、每日签到 |
| `login`、`register` | 登录 / 注册 |
| `posts`、`post`、`create_post` | 帖子列表 / 详情（含评论区）/ 发帖（Markdown、图片上传、草稿） |
| `notifications` | 通知中心 |
| `user_config`、`bind_email`、`set_avatar` | 用户设置、绑定邮箱、设置头像（后两个复用同一批组件） |
| `create_vote` | Markdown 投票生成器 |
| `webcounter`、`create_webcounter`、`my_webcounters`、`webcounter_dashboard` | 网页访问量计数器：介绍、创建、我的列表、控制面板 |
| `upload_file`、`bvdlp` | 图床 / 文件上传、B 站视频直链解析 |
| `music`、`share_music`、`about_music`、`embed_music` | 「一起听歌」：列表与播放器、分享、说明、嵌入播放器 |
| `connector` | 多设备图文互传 |

URL 就是目录名加斜杠（`/create_vote/`）。未迁移的旧页面：`admin`、`bind_aerfaying`、`ccw`、`midishow`、
`midi2scratch`、`midi_player`，其中 **MIDI 那三个暂缓迁移、先别动**（试过一版，因为 `html-midi-player`
与 `plugin-legacy` 冲突等问题整体回退了）。

## 写页面的约定

细节都在 [`AGENT.md`](./AGENT.md)，几条最要紧的：

- 布局与旧页面 1:1；与布局无关的交互细节（比如复制后提示什么文案）跟随共享组件现有做法，不要为它改共享组件。
- 域名和页面路径走 `import.meta.env.VITE_*`；图标用 `@tabler/icons-vue`；不要再引 `static/js` 里的旧脚本；
  不要手拼 HTML 字符串，用插值 + `v-for`。
- 动手前先看看 `v2/src/components/` 有没有现成的组件；被 2 个以上页面用到的组件再用 `git mv` 提升到那里。
- 改了 `vite.config.js`、全局 CSS 或共享组件之后，要跑一次布局比对。

组件速查：`BtnWithLoading`（异步按钮）、`ImageUploader` / `AvatarUploader`、`MarkdownInput` / `MarkdownDisplay` /
`MarkdownEdit`、评论区整套（`CommentsSection` / `CommentsList` / `AddCommentInput` / `EditCommentInput`）、
复制三件套（`CopyButton` / `TextDisplayWithCopy` / `TextareaDisplayWithCopy`）、`PaginationButtons`、
`RelativeTime`、标签相关（`TagsDisplay` / `TagSelect` / `TagEdit` / `TitleEdit`）、
`Dialog` / `PopupBackdrop` / `Folder` / `EmotionsBar` / `ClickToCopy`。

工具模块（`v2/src/assets/js/`）：`util.js`（`fetch_api`、`check_logged_in`、`copyToClipboard` 等）、
`captcha.js`（人机验证）、`darkMode.js`、`initMarked.js` 及 `markedCustomExt/`、`webcounter.js`（计数器四个页面共享）。

## 布局回归测试

`tools/layout-diff/layout_diff.py` 会从 git 历史里取出旧页面，和 `v2/dist` 里的新页面一起放进无头 Chrome、
跑同一串交互步骤，逐个元素比对位置、尺寸、字号和间距：

```bash
cd v2 && npm run build && cd ..
python3 tools/layout-diff/layout_diff.py --pages my_webcounters webcounter_dashboard
```

「间距 / 位置尺寸 / 样式」三类应当为 0（1~2px 算噪声）；「旧有新无 / 新有旧无」里有一些是可接受的结构差异。
各页面已知的基线和更多参数（`--width` 测窄屏、`--keep` 保留现场、`--baseline-dist` 自比对）见 `AGENT.md` 第 9.1 节。

## 鸣谢

`wux.css`（以及配套的 `wux-*` 类名体系）来自 **wux-ui**，作者 [wuxian425](https://github.com/wuxian425)，
本仓库用的是轻微修改过的版本。作者已删除原仓库，特此致谢。

---

[`AGENT.md`](./AGENT.md) ｜ <https://www.saobby.com>
