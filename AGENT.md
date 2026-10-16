# AGENT.md —— 用 Vue3 重写旧页面的操作指南

本文件写给接手本仓库的 AI Agent / 开发者：**如何把一个旧页面迁移成 `v2/` 里的 Vue3 页面**。
内容包括必须遵守的部署约束、重写步骤、页面模板、复用与替换规则，以及已经踩过的坑（重点在第 8 节）。

---

## 1. 仓库结构

```
/                          仓库根目录 = 部署后的站点根目录
├── index.html             首页（由 v2/src/pages/home/index.html 构建而来）
├── <page>/index.html      旧页面（要重写/删除的目标）
├── static/js/<page>.js    旧页面逻辑（要一起删除）
├── static/css/*.css       旧样式（common.css / wux.css），v2 里有一份对应副本
├── static/image/icon/*.svg 旧图标（重写时换成 tabler 图标组件）
└── v2/                    用 Vite + Vue3 写的多页应用（MPA）
    ├── src/pages/<page>/{index.html, main.js, App.vue}   每个目录 = 一个页面
    ├── src/components/*.vue                              跨页面共享组件
    ├── src/assets/js/{util.js, captcha.js, darkMode.js}   工具模块
    ├── src/assets/css/{common.css, wux.css, ...}          样式（与 static/css 基本一致）
    └── .env.production / .env.development                 环境变量
```

页面清单（`v2/src/pages/`）：`home`、`login`、`register`、`posts`、`post`、`create_post`、`notifications`、
`music`、`share_music`、`about_music`、`embed_music`、`connector`、`user_config`、`set_avatar`、`bind_email`、`create_vote`。
根目录还存在的文件夹（`webcounter`、`midi2scratch`、`create_webcounter`、`my_webcounters`、`upload_file`、`bvdlp`、
`midishow`、`admin`、`bind_aerfaying`、`ccw`、`webcounter_dashboard`、`midi_player`）都还是旧页面，等待迁移。

---

## 2. 构建与部署（必须先理解，否则会踩坑）

`.github/workflows/build.yml`：push 到 `development` 分支 →（A）用 Babel/terser/cssnano 压缩旧静态资源 →
（B）`cd v2 && npm ci && npm run build` →（C）把构建产物摊平到仓库根目录 → 强推提交到 `production` 分支。
其中第 C 步是：

```bash
cd v2
mv dist/assets/ ..           # → 站点根目录 /assets/
mv dist/src/pages/*/ ..      # 每个页面目录 → 站点根目录，即 /<page>/
cd ..
rm -rf v2                    # 构建产物就是最终站点，源码不进 production
mv home/index.html .         # 首页特殊处理：v2/src/pages/home/index.html → 根目录 /index.html
```

由此得到几条**硬性规则**：

1. **页面目录名 = URL 路径**。`v2/src/pages/create_vote/index.html` 构建后就是 `/create_vote/index.html`，
   也就是访问 `/create_vote/`。目录名必须与旧页面一致（否则 URL 会变）。
2. **重写时必须删掉根目录下的旧页面目录和旧 JS**，否则 `mv dist/src/pages/*/ ..` 会把新目录塞进同名旧目录里，
   变成 `create_vote/create_vote/index.html`：
   ```bash
   git rm -r create_vote             # 旧页面目录
   git rm static/js/create_vote.js   # 旧页面脚本
   # 删除前必须确认没人再引用它（有引用就先改掉再删）
   grep -rn "create_vote.js" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=v2/dist
   ```
3. `sitemap.xml` / `robots.txt` 里的路径**不用改**：重写后是同一个 URL，仍然有效。
4. 旧页面里的 `check_browser.js`、`saobbyCaptchaV3.js`、`darkMode.js`、`common.js` 等 `<script>` **不要再引入**，
   v2 里对应的能力由模块/组件提供（见第 7 节）。暗色模式的「防闪烁」内联样式与脚本由 `vite.config.js` 的
   `inject-dark-mode-critical-assets` 插件自动注入到每个 `index.html`，页面里不要自己写。
5. 页面 `<title>` 要与旧页面保持一致。

---

## 3. 重写步骤（checklist）

以 `create_vote` 为例（成品见 `v2/src/pages/create_vote/`）：

1. **读旧代码**：`<page>/index.html`（DOM 结构、文案、用到的 CSS 类）、`static/js/<page>.js`（逻辑、接口、参数名）、
   以及页面用到的人机验证/上传/复制等能力。
2. **建页面骨架**：新建 `v2/src/pages/<page>/` 下的 `index.html`、`main.js`、`App.vue`。
   逻辑复杂时再拆：纯逻辑放同目录的 `<page>.js`（参考 `v2/src/pages/music/music.js`、`share_music/share_music.js`），
   子组件放同目录的 `components/`。
3. **照搬行为，不要“顺手优化”**：接口地址与字段名、请求参数、校验文案、提示文案、页面文案、DOM 类名（`wux-*`、
   `result`、`label`、`simple`、`pre-like` 等在 v2 的 CSS 里都有）全部保持一致。旧代码用 `innerHTML` 拼 HTML 的地方，
   改用插值 + `v-for`（天然转义，避免 XSS），不要用 `v-html`/`rsc()`。
4. **图标换成 tabler 组件**（第 5 节）。
5. **跨页链接 / 外部服务域名换成环境变量**（第 4 节）。
6. **删除旧页面目录与旧 JS**（第 2 节规则 2）。
7. **构建 + 模拟部署验证**（第 9 节）。
8. **提交**：commit message 用中文，例如 `用Vue3重写xxx页面`（与 `git log` 里既有风格一致）。

### 3.1 `v2/src/pages/<page>/index.html` 模板

```html
<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <!-- 只 preconnect 本页真正会用到的域名 -->
        <link rel="preconnect" href="https://rumt-zh.com" crossorigin="">
        <link rel="preconnect" href="https://comments.saobby.com" crossorigin="">
        <link rel="preconnect" href="https://captcha-v3.saobby.com" crossorigin="">
        <script src="https://tam.cdn-go.cn/aegis-sdk/latest/aegis.min.js"></script>
        <script>
            if (typeof Aegis === 'function') {
                var aegis = new Aegis({
                    id: 'XVx8Jfg1VPkL0x0ea2',
                    uin: localStorage.getItem('rum_uin') || 'anonymous',
                    reportApiSpeed: true,
                    reportAssetSpeed: true,
                    spa: true,
                    hostUrl: 'https://rumt-zh.com'
                });
            }
        </script>
        <script type="text/javascript">
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "nghuq29wf0");
            window.clarity("set", "uin", localStorage.getItem("rum_uin") || "anonymous");
        </script>
        <title>与旧页面一致的标题</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="./main.js"></script>
    </body>
</html>
```

### 3.2 `v2/src/pages/<page>/main.js` 模板

```js
import { createApp } from 'vue';
import { initDarkMode } from '@/assets/js/darkMode.js';
import App from './App.vue';

import '@/assets/css/wux.css'
import '@/assets/css/common.css'

initDarkMode();
const app = createApp(App);
app.mount('#app');
```

### 3.3 `App.vue` 基本骨架

```vue
<script setup lang="js">
import { onMounted, ref } from 'vue';
import { ref 相关的工具 } from '@/assets/js/util.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import { IconXxx } from '@tabler/icons-vue';

const domain = import.meta.env.VITE_API_DOMAIN;          // 需要的域名都走环境变量
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;

onMounted(() => {
    // 旧页面结尾那段「没有 access-token 就跳登录」的样板代码，统一用这个
    check_logged_in();
});
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">与旧页面一致的面包屑</li>
        </ul>
        <div class="wux-typo">
            <!-- 旧页面的正文结构，类名保持不变 -->
        </div>
    </div>
</template>
```

---

## 4. 环境变量（不要硬编码域名/路径）

两个文件：

| 文件 | 是否提交 | 说明 |
|---|---|---|
| `v2/.env.production` | ✅ 提交 | 生产构建用的真实值 |
| `v2/.env.development` | ❌ 被 `v2/.gitignore` 忽略 | 只在本机存在，本地调试用；新增变量时要**手动同步加一份** |

命名规则：

- **页面 URL**：`VITE_<PAGE>_PAGE_URL`
  - `.env.production`：`VITE_CREATE_VOTE_PAGE_URL = "/create_vote/"`
  - `.env.development`：`VITE_CREATE_VOTE_PAGE_URL = "/src/pages/create_vote/"`（dev 服务器按源码路径访问）
- **外部服务域名**：`VITE_<SERVICE>_API_DOMAIN`，例如 `VITE_VOTE_API_DOMAIN = "https://vote.saobby.com"`
  （dev 里一般直接用生产域名，因为本地没有后端；README 也说明了这一点）
- 其它已有变量：`VITE_API_DOMAIN`（评论后端）、`VITE_IMAGE_UPLOAD_API_URL`、`VITE_HOME_PAGE_URL`、
  `VITE_MUSIC_PAGE_URL`、`VITE_SHARE_MUSIC_PAGE_URL`、`VITE_ABOUT_MUSIC_PAGE_URL`、`VITE_EMBED_MUSIC_PAGE_URL`、
  `VITE_CONNECTOR_API_DOMAIN`、`VITE_CONNECTOR_BASE_URL`、`VITE_BIRTHDAYSTAR_API_DOMAIN`、`VITE_MIDISHOW_API_DOMAIN`、
  `VITE_SITE_URL`、`VITE_USER_CONFIG_PAGE_URL`、`VITE_LOGIN_PAGE_URL`、`VITE_REGISTER_PAGE_URL`、`VITE_POSTS_PAGE_URL`、
  `VITE_POST_PAGE_URL`、`VITE_CREATE_POST_PAGE_URL`、`VITE_NOTIFICATIONS_PAGE_URL`、`VITE_SET_AVATAR_PAGE_URL`、
  `VITE_BIND_EMAIL_PAGE_URL`。

**关键：新增页面 URL 变量后，别的地方指向该页面的链接也要一起改成用变量**（“像首页其他按钮一样”）。
例如首页工具集里的投票入口：

```html
<!-- 之前（硬编码，重写后必须改） -->
<li><a href="/create_vote" target="_blank">Markdown实现投票功能</a></li>
<!-- 之后 -->
<li><a :href="createVotePageUrl" target="_blank">Markdown实现投票功能</a></li>
```

```js
const createVotePageUrl = import.meta.env.VITE_CREATE_VOTE_PAGE_URL;   // 与其它页面 URL 常量放在一起
```

改完记得 grep 一遍确认没有漏网的硬编码：
```bash
grep -rn '"/create_vote"\|"/create_vote/"' v2/src    # 应该没有输出
```

---

## 5. 图标：旧 SVG → `@tabler/icons-vue` 组件

旧页面用 `<img src="/static/image/icon/xxx-white.svg" width="16px" height="16px" class="middle">`，
**重写时一律改成 tabler 图标组件**：

```html
<!-- 旧 -->
<button class="wux-btn wux-btn-primary"><img src="/static/image/icon/plus-white.svg" alt="" width="16px" height="16px" class="middle"><span class="middle">添加选项</span></button>
<!-- 新 -->
<button class="wux-btn wux-btn-primary" type="button" @click="addOption()"><IconPlus width="16px" height="16px" class="middle"/><span class="middle">添加选项</span></button>
```

- 换算规则：去掉 `-white/-primary/-red/-green/...` 等颜色后缀 → 连字符转大驼峰 → 加 `Icon` 前缀。
- `class="middle"` 是 `common.css` 里的 `vertical-align: middle`，按钮里保持旧版对齐效果就用它。
- 图标名必须真实存在（rollup 遇到不存在的命名导出会**构建报错**，所以构建能兜底）。

**已在本仓库 v2 中使用过（可直接照抄）的映射**：

| 旧 SVG | tabler 组件 |
|---|---|
| plus-white | `IconPlus` |
| trash-white | `IconTrash` |
| copy-white | `IconCopy` |
| check-white / checks | `IconCheck` / `IconChecks` |
| upload-white / photo-up-white | `IconUpload` / `IconPhotoUp` |
| mail-white / mail-check | `IconMail` / `IconMailCheck` |
| unlink-white / link-white | `IconUnlink` / `IconLink` |
| login-white / login-2 / logout | `IconLogin` / `IconLogin2` / `IconLogout` |
| user / user-circle / settings | `IconUser` / `IconUserCircle` / `IconSettings` |
| bell-white / clock / refresh / search | `IconBell` / `IconClock` / `IconRefresh` / `IconSearch` |
| edit / pencil / pencil-check / eye | `IconEdit` / `IconPencil` / `IconPencilCheck` / `IconEye` |
| message / message-reply / message-plus | `IconMessage` / `IconMessageReply` / `IconMessagePlus` |
| thumb-up / thumb-up-filled | `IconThumbUp` / `IconThumbUpFilled` |
| tool / tag / label | `IconTool` / `IconTag` / `IconLabel` |
| music / vinyl | `IconMusic` / `IconVinyl` |
| history / versions | `IconHistory` / `IconVersions` |
| deselect / x | `IconDeselect` / `IconX` |
| file / file-description / markdown | `IconFile` / `IconFileDescription` / `IconMarkdown` |
| clover / cake / chart-dots | `IconClover` / `IconCake` / `IconChartDots` |
| mood-happy / corner-down-right / address-book | `IconMoodHappy` / `IconCornerDownRight` / `IconAddressBook` |
| caret-down / caret-up | `IconCaretDownFilled` / `IconCaretUpFilled` |
| brand-github / brand-qq / brand-wechat / brand-bilibili / brand-telegram | `IconBrandGithub` / `IconBrandQq` / `IconBrandWechat` / `IconBrandBilibili` / `IconBrandTelegram` |
| arrow-left / info-circle / circle-dashed-check | `IconArrowLeft` / `IconInfoCircle` / `IconCircleDashedCheck` |
| 播放器相关（music / midi_player 页面） | `IconPlayerPlayFilled` / `IconPlayerPauseFilled` / `IconPlayerTrackNextFilled` / `IconPlayerTrackPrevFilled` / `IconVolume` / `IconRepeat` / `IconRepeatOff` / `IconRepeatOnce` / `IconArrowsShuffle` |

**按同样规则推断（用前建议构建验证）**：`folder(-filled)`→`IconFolder`/`IconFolderFilled`、`pinned`→`IconPin`、
`palette`→`IconPalette`、`typography`/`typeface`→`IconTypography`、`external-link`→`IconExternalLink`、
`download`→`IconDownload`、`world`→`IconWorld`、`browser`→`IconBrowser`、`help`→`IconHelp`、
`keyboard`→`IconKeyboard`、`key`→`IconKey`、`lock`/`lock-open`→`IconLock`/`IconLockOpen`、
`tags`→`IconTags`、`trending-up`→`IconTrendingUp`、`logs`→`IconLogs`。

---

## 6. 复用已有组件（先找，再写）

**共享组件目录：`v2/src/components/`**（23 个）：`AddCommentInput`、`AvatarUploader`、`BindEmailForm`、
`BtnWithLoading`、`ClickToCopy`、`CommentsList`、`CommentsSection`、`Dialog`、`EditCommentInput`、`EmotionsBar`、
`Folder`、`ImageUploader`、`MarkdownDisplay`、`MarkdownEdit`、`MarkdownInput`、`PaginationButtons`、`PopupBackdrop`、
`RelativeTime`、`TagEdit`、`TagsDisplay`、`TagSelect`、`TextDisplayWithCopy`、`TitleEdit`。

规则：

1. **先 grep 有没有现成的**：`grep -rn "IconUpload\|upload_image" v2/src/components` 之类的检索比从零写划算得多。
2. 也可以直接引用**别的页面的私有组件**（有先例：`v2/src/pages/embed_music/App.vue` 引用了
   `@/pages/music/components/EmbeddedMusicPlayer.vue`）。
3. 如果一个组件被 **2 个及以上页面**使用，就把它**移动**到 `v2/src/components/`，并同步所有引用
   （用 `git mv` 保留历史）。真实案例：重写 `/set_avatar`、`/bind_email` 时，
   `AvatarUploader.vue`、`BindEmailForm.vue` 从 `v2/src/pages/user_config/components/` 提升到 `@/components/`，
   同时把 `user_config/App.vue` 的 `import` 改成 `@/components/...`；两个新页面只负责包一层
   `wux-container` + 面包屑 + `check_logged_in()`，业务逻辑零重复。
4. 常用组件的用途速查：
   - `BtnWithLoading`：异步按钮，`:is-loading` 时自动显示 `wux-loading` 并禁用（替代 `set_btn_html(btn, "...")`）
   - `ImageUploader` / `FormSubmitter`：图片上传（自动加人机验证 token、带进度）
   - `MarkdownInput` / `MarkdownDisplay` / `MarkdownEdit`：Markdown 编辑/渲染/行内编辑
   - `CommentsSection` / `CommentsList` / `AddCommentInput` / `EditCommentInput`：评论区
   - `PaginationButtons`、`RelativeTime`、`TagsDisplay`/`TagSelect`/`TagEdit`、
     `Dialog`/`PopupBackdrop`、`ClickToCopy`/`TextDisplayWithCopy`、`EmotionsBar`、`Folder`

---

## 7. 旧的全局函数/脚本 → v2 模块对照表

| 旧页面写法 | v2 里怎么写 |
|---|---|
| `gebi("id")` 直接操作 DOM | 用 `ref` + `v-model` 驱动；真需要 DOM 时才 `import { gebi } from '@/assets/js/util.js'`，或 `ref="xxxRef"` 后 `xxxRef.value.click()` |
| `set_btn_html(btn, "请稍候"/"...")` | `<BtnWithLoading :is-loading="loading" @click="submit()">文本</BtnWithLoading>` |
| `captcha_v3()` + `<script src="/static/js/saobbyCaptchaV3.js">` | `import { captcha } from '@/assets/js/captcha.js'` 后 `await captcha()`（验证码 DOM/样式由组件自己注入）；需要多次验证用 `gen_captcha()` |
| `fetch_api(url, payload)` / `fetch_data(...)` | 同名函数，`import { fetch_api, fetch_data } from '@/assets/js/util.js'`（返回 `{retcode, msg, data}`，与原版语义一致） |
| `copy_text(text, btn)` | `await copyToClipboard(text)`（`util.js`，带降级方案）或直接用 `<ClickToCopy :value="text"/>` |
| `rsc()` + `innerHTML` 拼 HTML | Vue 插值 / `v-for`（默认转义）；**不要**再手写 HTML 字符串 |
| 页面末尾那段 `null == localStorage.getItem("access-token") && (…window.location="/login")` | `onMounted(() => check_logged_in())` |
| `<script src="/static/js/darkMode.js">` | `main.js` 里 `initDarkMode()`（新页面默认已加） |
| `ts2str` / `relative_time` / `getUrlArgs` / `setUrlArgs` / `updateUrlArgs` / `is_in_array` / `insertIntoTextarea` / `shuffle` / `gen_randint` | `util.js` 里同名导出；旧 `include(a, list)` 对应新的 `is_in_array(a, list)` |
| `new XMLHttpRequest` + `FormData` + `upload.onprogress` 上传 | `new FormSubmitter(url, formData, true, (p)=>{...}).send()` |
| `<script src="/static/js/check_browser.js">` | 不再需要（`vite.config.js` 里的 `@vitejs/plugin-legacy` 负责旧浏览器兼容） |
| `marked` / `katex` / `highlight.js` 手动初始化 | 用 `@/components/MarkdownDisplay.vue`、`MarkdownInput.vue`，或 `initMarked` 相关模块 |

---

## 8. 常见坑（都是已经踩过的，务必逐条自查）

### 8.1 Vue 会吃掉“换行产生的空格”，导致元素贴在一起（很丑）

- **现象**：旧 HTML 里
  ```html
  <button class="wux-btn wux-btn-primary">创建投票</button>
  <span class="result"></span>
  ```
  两个行内元素之间的换行会被浏览器渲染成一个空格，所以旧页面看起来有间隔；
  但 **Vue 模板编译默认 `whitespace: 'condense'`，元素之间“只含换行的空白文本节点”会被直接删掉**，
  于是重写后按钮和红色提示文字**贴死**了（`result` 文本和「创建投票」按钮没间隔就是这个原因）。
- **解法**：不要依赖换行，用项目现成的间距工具类（`v2/src/assets/css/common.css`）：
  - `.simple` → `margin-left: 3px`
  - `.sep` → `margin-left: 6px`（更明显地拉开距离时用它）
  ```html
  <BtnWithLoading btn-class="wux-btn-primary label" :is-loading="creating" @click="submit()">创建投票</BtnWithLoading>
  <span id="result" class="result sep">{{ result }}</span>
  ```
- **怎么排查**：`.wux-form-input` 是 `display: block`（独占一行），所以块级元素之间不受影响；
  只需检查**相邻的行内元素**（按钮 + 文本、图标 + 文本、多个按钮并排）。全页扫一遍这些位置就不会再出“贴一起”的观感问题。

### 8.2 忘了删旧页面 → CI 部署出目录嵌套

`mv dist/src/pages/*/ ..` 遇到已存在的同名目录会把新目录塞进去（`create_vote/create_vote/index.html`），
站点直接挂。**重写完必须 `git rm -r <page>` 和 `git rm static/js/<page>.js`**，并 grep 确认没人引用旧 JS。

### 8.3 忘了同步 `.env.development`

`.env.development` 被 gitignore，新增的环境变量（页面 URL / API 域名）**只加在 `.env.production` 里的话，
本地 `npm run dev` 会拿到 `undefined`**。本地调试记得手动补一份，页面 URL 用 `/src/pages/<page>/` 形式。

### 8.4 忘了把其它页面的链接改成环境变量

新页面可能被首页/其它页面引用。重写后要顺手把这些链接改用 `VITE_<PAGE>_PAGE_URL`
（“像首页其他按钮一样”），最后 `grep -rn '"/<page>"' v2/src` 确认无残留硬编码。

### 8.5 登录校验与子组件挂载顺序

`check_logged_in()` 放在父组件 `onMounted` 里（与 `user_config` 一致）；注意**子组件的 `onMounted` 先于父组件执行**，
未登录时子组件可能先发一次请求再跳登录页。若要求严格“先跳转再请求”，可在父组件 `setup` 顶层同步调用
`check_logged_in()`。

### 8.6 提交中禁用表单

旧代码用一个递归函数禁用 `#config` 里所有子元素。Vue 里**逐个控件绑 `:disabled="creating"`**，
不要用 `<fieldset disabled>`（会引入默认边框/间距样式差异），DOM 结构保持与旧页面一致。

### 8.7 数组选项与数字输入

- 动态选项列表（旧 `options = ["",""]` + `render_options()`）用 `options = ref(["", ""])` +
  `v-for="(option, index) in options"` + `v-model="options[index]"`（Vue3 支持数组下标 v-model）。
- 旧代码用 `onchange`，`v-model` 默认绑 `input` 事件（更即时）——校验逻辑要相应确认一遍。
- 数字输入被清空时 `v-model` 得到 `""`，校验要沿用旧文案（例如 `fontSize.value === ""` → “所有字段均不能为空”）。

### 8.8 不要重复造轮子（复用优先）

同一段逻辑写在两个页面里就是 bug 温床。先看 `v2/src/components/`，再看其它页面的 `components/`；
被 2 个以上页面使用的组件就提升到 `@/components/`（`git mv` + 更新所有 import）。
反例/正例见第 6 节第 3 条（`AvatarUploader` / `BindEmailForm`）。

---

## 9. 验证清单（每次重写后都要跑一遍）

```bash
cd v2
npm run build                                  # 必须成功退出（EXIT=0）
# 本机没有 node/npm 时，可用任意 Node ≥18 直接跑：
# node node_modules/vite/bin/vite.js build

ls dist/src/pages/<page>/index.html            # ① 产物存在
grep -o 'api/xxx\|vote.saobby.com\|页面关键词' dist/assets/<page>-*.js   # ② 接口域名、文案都在
grep -o '/assets/[A-Za-z0-9._-]*' dist/src/pages/<page>/index.html | sort -u | \
  while read p; do [ -f "dist$p" ] || echo "MISSING $p"; done            # ③ 产物引用的资源都存在

cd .. && grep -rn "static/js/<page>.js\|/static/image/icon/" <page>/ v2/src || true   # ④ 无旧引用
```

**⑤ 模拟 CI 的摊平步骤（确认没有目录嵌套）**：把 `v2/dist` 复制到临时目录，用空的“根目录”执行 CI 那几条 `mv`：

```bash
rm -rf /tmp/deploytest && mkdir -p /tmp/deploytest/v2/root
cp -a v2/dist /tmp/deploytest/v2/dist
cd /tmp/deploytest/v2/root
mv ../dist/assets . && mv ../dist/src/pages/*/ . && mv home/index.html . && rm -rf home
ls                    # 应看到 <page>/index.html、index.html 平铺在根目录
ls -d */<page>        # 应无输出（没有嵌套）
```

**⑥ 本地联调**：`cd v2 && npm run dev`，访问 `http://127.0.0.1:5173/src/pages/<page>/`
（dev 服务器按源码路径访问，直接开 `/` 是 404）。未登录的页面记得准备 `localStorage["access-token"]`。

---

## 10. 参考实现

| 页面 | 可以学到什么 |
|---|---|
| `v2/src/pages/home/` | 整体布局、组件复用、所有跨页链接都用 `VITE_*_PAGE_URL` |
| `v2/src/pages/login/`、`register/` | 表单 + `captcha()` + `BtnWithLoading` + 登录后 `login_redirect` |
| `v2/src/pages/create_post/`、`post/`、`posts/` | Markdown 编辑/渲染、草稿、评论、URL 参数 |
| `v2/src/pages/notifications/` | 列表 + 分页 + 批量操作 + 状态 tab |
| `v2/src/pages/user_config/` | tab 结构；`AvatarUploader`/`BindEmailForm` 已提升为共享组件 |
| `v2/src/pages/create_vote/` | 表单 + 动态选项数组 + 颜色选择器 + RGB 滑块 + 人机验证 + 生成 Markdown + 复制；**图标全部换成 tabler 组件、域名走环境变量、`result` 用 `.sep` 拉开间距** |
| `v2/src/pages/set_avatar/`、`bind_email/` | 最省事的迁移方式：直接复用 `user_config` 的组件，只写容器/面包屑/登录校验 |

## 11. 不要做的事

- ❌ 不要修改旧页面的 URL 路径（目录名必须与旧页面一致）。
- ❌ 不要在 `v2/src/pages/<page>/index.html` 里手写暗色模式内联样式/脚本（插件会自动注入）。
- ❌ 不要再引入 `common.js`、`darkMode.js`、`check_browser.js`、`saobbyCaptchaV3.js`、`tab.js` 等旧脚本。
- ❌ 不要用 `/static/image/icon/*.svg`（改用 tabler 组件）。
- ❌ 不要硬编码 `https://xxx.saobby.com` 或 `/<page>/`（改用环境变量）。
- ❌ 不要为了“更好看”擅自改动文案、接口参数、校验规则；重构 ≠ 改需求。
