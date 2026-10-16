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
- **颜色怎么处理**（旧 SVG 里是把颜色写死的 `style="color:..."`）：
  - `xxx-white.svg` 在 `wux-btn-primary` 之类的按钮里 → **不要写颜色**，让它继承 `currentColor`（按钮文字本来就是这个色）。
  - `xxx-primary.svg` 用在 `wux-btn-text` / `wux-btn-outline` 按钮里 → 同样**不要写颜色**，继承按钮文字色即可（浅色下就是 `#4050b4`，暗色模式会自动跟随主题，比旧版写死更好）。
  - `xxx-grey.svg` 用在正文旁边的灰色小字 → 加 `class="middle gray"`（`.gray{color:#777 !important}`），别手写 `style="color:#777"`。

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
5. **多个页面属于同一个应用时，共享逻辑放 `v2/src/assets/js/<app>.js`**。例：`webcounter`（网页计数器）有 4 个
   页面，就把它们的 API 域名、图片/Markdown 代码生成、控制面板 URL 等放进 `v2/src/assets/js/webcounter.js`，
   4 个页面都从这里 import，不要在页面里各写一份。
6. **页面私有代码就近放**：页面专属的工具模块放页面目录（`v2/src/pages/webcounter_dashboard/` 下的
   `webcounter_charts.js`、`country_code_map.js`、`echartsLoader.js`），页面专属子组件放
   `v2/src/pages/<page>/components/`（`OverviewTab.vue`、`LogTab.vue`、`SettingsTab.vue`、`Chart.vue`）。
   只有被 2 个以上**页面**用到的组件才提升到 `v2/src/components/`。

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

### 8.1 模板换行会被 Vue 吃掉 → 间距要在「局部」补回来（不要去改全局编译选项）

旧页面是普通 HTML：元素之间的换行会被渲染成一个空格（本项目字体下约 9.6px）。Vue 模板默认
`whitespace: 'condense'` 会删掉「只含换行的空白节点」，于是重写后会出现「输入框和按钮贴在一起、
select 和按钮贴在一起」这类问题。

**修法是局部的**（`v2/vite.config.js` 里曾加过 `whitespace: 'preserve'`，已回退——原因见 9.2）：

- 想在一行里让 A、B 之间有一个空格：把它们写在**同一行**、中间留一个空格（与旧 HTML 写法一致）：
  ```html
  <input ...> <BtnWithLoading ...>搜索</BtnWithLoading><br>
  ```
  `condense` 只删「含换行的空白节点」，同一行里的空格会保留，渲染结果和旧页面一致。
- 在按钮内部放图标+文字时，图标和文字要写在**同一行**（否则会多出一个空格）。
- 旧页面本来就更宽的间距才用 `.simple`(3px) / `.sep`(6px) 之类的类去补。
- 块级元素（`.wux-form-input`、`.wux-card`、`<hr>` 等）之间不受影响，不用管。



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

### 8.9 第三方库用 npm 包；大的数据文件当普通资源「构建 + 懒加载」

（这一节来自 `/webcounter_dashboard` 改造的返工：一开始图省事沿用了旧页面的 `/static/js/echarts.min.js`、
`/static/js/world_cn.json`、`/static/js/resize-observer.umd.min.js`，后来全部改成了正规做法。）

**第三方库 → npm 包**
- 用 npm 装：`cd v2 && npm install echarts@^5.6.0`（与旧页面 bundle 的 echarts 5.4.x 保持同大版本，别顺手升到 6.x）。
- **加依赖必须同时提交 `v2/package.json` 和 `v2/package-lock.json`**：CI 跑的是 `npm ci`，两者不同步会直接失败。
  不要手改 lock，交给 npm 生成。
- 用**动态 `import()`** 引用，构建工具会拆成独立的懒加载 chunk，不阻塞首屏：
  ```js
  const echarts = await import("echarts");   // → index-<hash>.js，按需加载
  ```
- 本机没有 npm 时，可以直接用 npm 官方 tarball（它自带全部依赖）来跑：
  ```bash
  curl -sSL -o /tmp/npm.tgz https://registry.npmjs.org/npm/-/npm-10.9.2.tgz
  mkdir -p /tmp/npmpkg && tar -xzf /tmp/npm.tgz -C /tmp/npmpkg
  cd v2 && node /tmp/npmpkg/package/bin/npm-cli.js install echarts@^5.6.0 --no-audit --no-fund --ignore-scripts
  ```

**大的数据/资源文件 → 放进页面目录，用动态 `import()` 当资源加载**
- 不要硬编码 `/static/...` 的 URL，也不要 `fetch(url)`：把文件放到页面目录（例：
  `v2/src/pages/webcounter_dashboard/world_cn.json`），然后
  ```js
  const worldMap = (await import("./world_cn.json")).default;   // → world_cn-<hash>.js，按需加载
  ```
  这样它会像 js/css 一样被构建、带 hash、跟着版本更新，并且是懒加载的。
- 只在真正需要时加载，并做单例缓存避免重复 import。完整示例见
  `v2/src/pages/webcounter_dashboard/echartsLoader.js`。
- 改造完后旧静态文件就没人用了，顺手删掉（本次删了 `static/js/echarts.min.js`、`static/js/world_cn.json`、
  `static/js/resize-observer.umd.min.js`；删前 grep 确认全仓库没有引用）。

### 8.10 大对象字面量用 sed 机械提取，别手抄

`country_code_map.js`（250 个国家和地区）这种长字典，从旧文件里**整行搬运**再包一层 export
（下面是本次用的命令，留作以后参考；被提取的旧文件 `static/js/webcounter_dashboard.js` 迁移后已删除）：

```bash
{ echo 'export const countryCodeMap = ';
  sed -n '792p' static/js/webcounter_dashboard.js | sed 's/^[[:space:]]*const country_code_map = //';
} > v2/src/pages/webcounter_dashboard/country_code_map.js
cp v2/src/pages/webcounter_dashboard/country_code_map.js /tmp/x.mjs && node --check /tmp/x.mjs   # 语法校验
```

字典里可能有 `ε`、空字符串 key 这种**肉眼看不见的字符**，手抄必错。

### 8.11 分页：复用 `PaginationButtons.vue`，`btnAmount` 传 7

旧代码用的是 `gen_cp_buttons(page_index+1, page_amount, 6, ...)`，它和 `PaginationButtons` 传 `btnAmount=7`
生成的按钮**完全一样**（都是 `p-3 … p+3`，两端同样会变成 `«`/`»`），所以直接用现有组件、传 7。
组件自带「第x/y页」，可以替掉旧页面里单独的 `<span>第…页</span>`。

### 8.12 tab 页「点一下重新加载」的语义 + 懒加载

旧页面把 `onclick` 写在 tab 的 radio 上，**点当前 tab 也会重新加载**。要保持这个行为要用
`:checked` + `@click`（而不是 `v-model`/`@change`），并让子组件用 `defineExpose` 暴露
`loadAll()` / `loadLogs(0)` / `loadSettings()` 给父组件调用：

```html
<input class="wux-tab-item" type="radio" name="tab-dashboard" id="tab-log-query"
       :checked="tab === 'log'" @click="switchTab('log')">
```

非默认展示的 tab 组件**不要**在 `onMounted` 里自动请求（旧页面也是点了才加载），否则一进页面就打一堆接口。

### 8.13 图表组件：容器可见后再 init，切换/重载时 dispose

- 用 `v-if` 在「图表容器」和「加载中占位」之间切换，并且**只在 loading 结束、容器已经显示之后再
  `echarts.init`**：对 `display:none` 的容器 init 会得到 0×0 的空白图（旧页面的 `set_chart_status` 就是这个顺序）。
- `watch([loading, option], …, {immediate:true})` + `nextTick()` 组合能保证 DOM 已经更新。
- 图表要跟随尺寸变化时，用 **`window` 的 `resize` 事件 + `chart.resize()`**（见 `Chart.vue`）。
  **不要用 `ResizeObserver`**：它是浏览器 API，core-js 不覆盖它（`grep -r ResizeObserver v2/node_modules/core-js`
  没有结果），而 `@vitejs/plugin-legacy` 的自动 polyfill 正是基于 core-js —— 也就是说**构建流程/babel 补不了它**。
  旧页面只能额外引 `@juggle/resize-observer` 的 UMD 文件，迁移后改用 `window.resize` 就不需要这个 polyfill 了
  （本页容器宽度只随窗口变化，`window.resize` 足够）。
- 组件卸载或重新加载时 `chart.dispose()`，避免实例泄漏（旧代码每次渲染都新建实例，从不销毁）。
- 「暂无数据」这类提前 `return` 的分支，旧页面会**保留加载态并显示提示**，照做即可。

### 8.14 页面级内联样式怎么放

旧页面 `<head>` 里针对 `.wux-card-body h2`、`.wux-card-body h6`、`.wux-col`、`.big-number` 这些**会作用到
子组件**的覆盖样式，放进该页面 `App.vue` 的**非 scoped** `<style>`（每个页面是独立入口，不会污染别的页面）；
只作用于组件自己的样式（`.chart-container`、`.log-table`、`.color-preview`）放组件自己的 scoped style。

### 8.15 迁移后顺手清理死代码

公共脚本可能因为迁移而变成没人引用（例：`static/js/change_page_buttons.js` 的最后一个使用者
`my_webcounters`/`webcounter_dashboard` 迁移完后已无人引用）。删除前先 grep 全仓库确认：

```bash
grep -rn "change_page_buttons" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.idea --exclude-dir=v2/dist
```

### 8.16 页面级覆盖要写足特异性；**不要动全局 CSS 顺序**

- 旧页面 `<head>` 的顺序是 `common.css` → `wux.css`，而 v2 的 `main.js` 一直都是 `wux.css` → `common.css`
  （**已调好的 v2 页面都是按这个顺序调的**）。两个文件里有同特异性的冲突规则（例：`.label{margin-top:3px}`
  vs `.wux-form-input{margin:0}`），**擅自把全仓库的顺序调换会让已调好的页面整体位移**（本次试过：
  `create_vote` 出现 36 处位置差异，已回退，见 9.2）。
  新页面若想要旧页面那种效果，就在页面自己的样式里写清楚，例如
  `.wux-typo .label.wux-form-input{margin-top:0}`，不要动全局顺序。
- 页面级覆盖（把旧页面 `<head>` 内联样式搬过来的那些）要写足特异性，不要依赖顺序：v2 在 dev
  （样式由 JS 按模块顺序注入）与 build（抽取成 CSS chunk）下顺序并不稳定。例如旧页面写
  `.wux-card-body h2{margin-top:0}` 能盖住 `.wux-typo h2{margin-top:24px}`，在 v2 里要写成
  `.wux-typo .wux-card-body h2{...}`（这正是「控制面板卡片顶部到标题间隔太大」的成因）。

### 8.17 用 `tools/layout-diff` 做「真实渲染」布局比对

见第 9.1 节。**每次重写完一个页面都应该跑一遍**：它是唯一能发现「间距/外边距/顺序」这类问题的自动化手段。


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

### 9.1 用工具做「真实渲染」布局比对（强烈建议每次都跑）

`tools/layout-diff/` 是本仓库配套的布局差异检查工具，专门回答「重写后的页面和旧页面长得一样吗」：

```bash
cd v2 && npm run build                                  # 先构建
python3 tools/layout-diff/layout_diff.py                # 检查所有已迁移页面
python3 tools/layout-diff/layout_diff.py --pages my_webcounters webcounter_dashboard
python3 tools/layout-diff/layout_diff.py --tol 2 --width 400     # 更严格 / 窄屏
python3 tools/layout-diff/layout_diff.py --pages webcounter_dashboard --top 30 --keep
```

原理：
1. 从 git 历史里取出旧页面的 `index.html`（以及它运行时需要、但迁移时已经删掉的 `static/js/*.js`，
   包括 `echarts.min.js`、`world_cn.json` 这类运行时加载的文件），和 `v2/dist` 构建出来的新页面放进同一个 http 根目录；
2. 用本机 Chrome 无头模式打开 `probe.html`：把新旧页面放进两个同源 iframe，等渲染稳定后量出
   **每个可见元素的 rect / 外边距 / 字号**，以及**每个父元素里相邻子元素之间的水平或垂直间距**；
3. `/api/*` 由工具自带的 mock 返回**同一份**固定数据（并把页面里的后端域名改写成本地地址），
   所以「已加载」状态的布局也能比，而且两边数据完全一致；
4. 按元素 key 配对做 diff，输出四类结果：间距差异、位置/尺寸差异、旧有新无/新有旧无、样式差异。

怎么读报告：
- **`间距`、`位置/尺寸`、`样式` 三类属于「布局差异」，应当为 0（或只有能解释的 1~2px）**；
- `旧有新无 / 新有旧无` 里很多是**结构差异而非布局差异**，例如：
  - 旧页面 `icon_with_text()` 会多包一层 `<span class="middle">`，新版用 tabler 组件没有这层；
  - 分页：旧页面是自己拼的 `div.wux-btn-group.mt` + `<span>第x/y页</span>`，新版复用 `PaginationButtons`
    （多一层 wrapper、页码带 `margin-left:20px`）——这是仓库统一后的既有权衡；
  - 旧 checkbox 是 `input + span`，新版包成 `<label>`（可点文字切换）之类的小改进。
  这些不会造成可见布局差异，报告里会出现但可以接受。
- `--keep` 会把临时目录（`/legacy`、`/new`、`probe.html`）留下，方便自己开浏览器复现；
- 有 tab 的页面会自动额外点开再量一次（见脚本里的 `CLICK_STATES`）。

**本次迁移后的基线**（跑出来的结果，可作为回归参考）：

| 页面 | 默认状态 | 其它状态 |
|---|---|---|
| `webcounter`、`create_webcounter` | 0 | — |
| `webcounter_dashboard` | 0 | 点「设置」= 0；点「日志查询」只剩分页结构差异 + 页码 6.6px |
| `my_webcounters` | 只剩结构差异（旧页 icon 外层 span + 分页）+ 页码 6.6px | — |
| `create_vote` | 只剩结构差异（取色器 input、分页） | — |
| `set_avatar`、`bind_email` | 只剩 `mc`（inline-flex）按钮带来的 ~5px 基线差异 | — |

### 9.2 改了「全局」配置后，一定要做一次 A/B

`vite.config.js`（编译选项、插件）、所有页面共用的 CSS、`src/components` 里的共享组件，任何一处改动都可能
悄悄影响**已经调好的页面**。做法（本次改 `whitespace: 'preserve'` 和 CSS 引入顺序时就是这么做的）：

```bash
# 1) 备份「改后」的版本
cp v2/vite.config.js /tmp/ab-vite.config.js && cp -r v2/src/pages /tmp/ab-pages

# 2) 把全局改动临时还原（这里以还原成 HEAD 为例）
git checkout HEAD -- v2/vite.config.js v2/src/pages/*/main.js

# 3) 构建 + 跑工具，记录「改之前」的每个页面数字
cd v2 && npm run build && cd ..
python3 tools/layout-diff/layout_diff.py --pages login register posts post create_post notifications user_config home > /tmp/ab-before.log

# 4) 恢复改动，重新构建，再跑一次同一批页面
cp /tmp/ab-vite.config.js v2/vite.config.js && rm -rf v2/src/pages && cp -r /tmp/ab-pages v2/src/pages
cd v2 && npm run build && cd ..
python3 tools/layout-diff/layout_diff.py --pages login register posts post create_post notifications user_config home > /tmp/ab-after.log

# 5) 相减：任何页面的「间距/位置尺寸」数量变大就是回归，必须修掉或回退全局改动
grep -E '^页面|差异总数' /tmp/ab-before.log /tmp/ab-after.log
```

**本次的实测结论（血的教训）**：只比「与旧页面的差异数」是不够的——我据此一度以为「没变差」，
用 `--baseline-dist` 自比对后才发现两项全局改动都动了**已调好的页面**，因此**全部回退**：

| 全局改动 | 它改动了哪些已调好的页面（改动前 vs 改动后） |
|---|---|
| `whitespace: 'preserve'` | `bind_email` 5 处、`login` 3、`register` 3、`user_config` 2~5、`notifications` 2、`home` 43、`music` 50（多出的空格还导致搜索行**换行重排**）、`share_music` 24 |
| 20 个 `main.js` 的 CSS 顺序调换 | `create_vote` 36 处（`.label` 控件的 3px 外边距被改掉，累计位移 12~36px） |

回退后的状态：
- 上述 9 个页面（× 各自交互状态）与「改动前」**几何完全一致**（自比对全为 0）；
- 缺的间距改为**只在本次新写的 4 个 webcounter 页面里**用「同一行 + 一个空格」局部补（新页面本来还在迭代），
  补完后这 4 个页面 vs 旧页面的布局差异只剩「分页页码 6.6px」（来自仓库统一的 `PaginationButtons`，见 9.1）。

**所以规矩是**：`vite.config.js`（编译选项）、全局 CSS、共享组件的任何改动，提交前必须跑一次
`--baseline-dist` 自比对，把**已调好的页面**当作基准；只有自比对全 0 才算安全。

**更直接的问法：「这次全局改动会不会改到我已经调好的 v2 页面？」**（跟旧版页面无关）——
那就别拿旧页面当基准，而是**让两套 v2 构建互相比**（工具的 `--baseline-dist` 自比对模式）：

```bash
# 1) 留档当前（改动后）的构建
cp -r v2/dist /tmp/ab-after-dist
# 2) 临时还原全局改动，构建「改动前」的那一套
git checkout HEAD -- v2/vite.config.js v2/src/pages/*/main.js && (cd v2 && npm run build) && cp -r v2/dist /tmp/ab-before-dist
# 3) 恢复改动并重新构建
cp /tmp/ab-after-dist ...   # （或直接用备份的源码还原，见 9.2 上一段的脚本思路）
(cd v2 && npm run build)
# 4) 两套构建互相比（两边都是 v2 页面、同一份 mock、同一串交互）
python3 tools/layout-diff/layout_diff.py --baseline-dist /tmp/ab-before-dist --pages <要确认的页面…>
```

报告里的「间距 / 位置尺寸 / 样式」只要不是 0，就说明**这次全局改动确实动了那个页面的布局**（哪怕数值很小）。
`--baseline-dist` 模式会把两套构建分别放到 `/buildA/`、`/buildB/`，并把 `/assets/` 改写成各自的前缀，
所以两套 hash 资源不会互相干扰。

---

### 9.3 状态覆盖：说清楚「测到了什么、没测到什么」

工具**每次运行只量一个 DOM 状态**，所以「跑过这个页面」≠「这个页面的所有状态都没问题」。目前的实际覆盖：

**页面**：`v2/src/pages` 下 20 个页面全都跑过；其中 `music`、`share_music`、`about_music`、`embed_music`、
`connector` **在仓库里没有旧版本**（不是从旧页面重写来的，见脚本会打印「跳过 …」），因此没有可比对的基线。

**状态**（`STATES` 配置 + 默认状态；新旧页面执行同一串步骤）：

| 页面 | 已覆盖状态 | 结果（布局差异=间距/位置尺寸/样式） |
|---|---|---|
| `webcounter`、`create_webcounter` | 默认 | **0** |
| `webcounter_dashboard` | 默认 / 日志 tab / 日志+自动刷新 / 设置 tab / 切换时间段 × （有数据、空数据） | 布局差异只剩「分页页码 6.6px」（+ 与旧页面的结构差异） |
| `my_webcounters` | 默认 / 翻页 / 搜索 × （有数据、空数据） | 同上 |
| `create_vote` | 默认 / 添加选项 | **0** |
| `user_config` | 默认 / 绑定邮箱 tab / 设置头像 tab | 剩 7~11 处位置差异（更早的重写留下的） |
| `login`、`register`、`post` | 默认 / 提交表单 | 0~1 处（来自更早的重写） |
| `posts`、`notifications`、`create_post` | 默认 / 翻页 / 预览切换 | 有真实差异（例：posts 搜索行会换行、通知列表 12 处位置差），属**更早那几次重写**遗留，未在本次修复 |
| `home` | 默认 | 差异最大（首页是整体改版，非等价格式重写） |

**已知覆盖不到、需要人工看或补 mock 才能测**：
- 需要后端成功返回才能到达的状态：发表帖子/创建投票/创建计数器的**成功面板**、验证码完整流程、
  上传进度、评论发布后的插入、通知「全部已读」等；
- 悬停/聚焦/禁用/加载中这些**瞬时态**（工具是在「稳定后」量一次）；
- 真实数据边界（超长标题、超多标签、极长 URL 换行）——可以往 `api_fixtures()` 里加极端数据来补；
- 响应式断点：`--width 400`（或其它宽度）再跑一遍才能比较窄屏。

**加状态的正确做法**：往 `STATES` 里加步骤串（`click:` / `type:<css>=<值>` / `select:<css>=<值>` / `wait`），
选择器要新旧页面都能匹配（优先用 id 或 `.wux-*` 类名），然后 `--pages <页面>` 单独跑一次；
如果这步在新页面里没有对应元素，报告会以「旧有新无」的形式暴露出来。

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
| `v2/src/pages/webcounter/`、`create_webcounter/`、`my_webcounters/`、`webcounter_dashboard/` | 一个「应用」拆成 4 个入口页面的组织方式；共享逻辑放 `src/assets/js/webcounter.js`；表单 + 人机验证 + 复制按钮 + 列表分页；`webcounter_dashboard` 含 tab、ECharts 图表（**echarts 走 npm 依赖 + 地图 JSON 走动态 import 懒加载**）、日志表格、自动刷新、设置表单 |

## 11. 不要做的事

- ❌ 不要修改旧页面的 URL 路径（目录名必须与旧页面一致）。
- ❌ 不要在 `v2/src/pages/<page>/index.html` 里手写暗色模式内联样式/脚本（插件会自动注入）。
- ❌ 不要再引入 `common.js`、`darkMode.js`、`check_browser.js`、`saobbyCaptchaV3.js`、`tab.js` 等旧脚本。
- ❌ 不要用 `/static/image/icon/*.svg`（改用 tabler 组件）。
- ❌ 不要硬编码域名/路径：业务域名、页面 URL 用环境变量（第 4 节）；第三方库用 npm 包；数据文件放页面目录用
  动态 `import()` 加载（第 8.9 节）；只有图片这类真正的静态素材才引用 `/static/image/...`。
- ❌ 加 npm 依赖时必须用 npm 安装并提交 `v2/package-lock.json`（CI 用 `npm ci`，lock 不同步会构建失败）；
  不要手工改 lock，也不要往 `v2/src` 里复制一份库文件。
- ❌ 不要为了“更好看”擅自改动文案、接口参数、校验规则；重构 ≠ 改需求。
- ❌ 不要动全局的 CSS 引入顺序（已调好的页面是按 `wux.css → common.css` 调的；要旧页面那种效果就在页面样式里写清楚，第 8.16 节）。
- ❌ 不要开启 `template.compilerOptions.whitespace: 'preserve'`（会把所有页面模板里的换行都变成空格，动到已调好的页面，第 8.1/9.2 节）。
- ❌ 不要用 `.simple`/`.sep` 去补旧页面里「一个普通空格」的间距，用「同一行 + 一个空格」的写法（第 8.1 节）。
- ❌ 改了 `vite.config.js` / 全局 CSS / 共享组件后，不跑 `--baseline-dist` 自比对就提交（第 9.2 节）。

## 12. 注释规范：只写必要的

- **只解释「为什么」，不解释「是什么」**：函数/变量名已经说清的不要再写。例如
  `getCounterImageUrl` / `getCounterDashboardUrl` 不需要注释，而 `getPicTypeName` 要注明 `0=JPEG 1=SVG`。
- **不要写迁移背景**：像「与旧页面 xxx 保持一致」「旧代码原来是怎样」这类内容写在 AGENT.md 或 commit message 里，
  不要写进代码（旧版本随时能查，而且这些页面重写完之后就没有「旧页面」了）。
- **长度克制**：一处 1~3 行；同一个坑在 AGENT.md 里讲一次就够，代码里只留一句提示。
- 值得保留的几类：API 字段/枚举映射、非显然的顺序或时机要求（如「容器显示后再 init，避免 0×0」）、
  违反直觉的取舍（如「ResizeObserver 是浏览器 API，core-js 补不了，所以用 window resize」）、
  生成文件的「勿手改」说明。
- TODO/FIXME 必须写清原因和触发条件。

- ❌ 删除旧静态资源（`static/js/*.js`、`static/*.json` 等）前先 grep 全仓库确认没有引用
  （注意 v2 里的 `src/assets/js/emojis.js`、`home/index.html` 仍会引用 `/static/image/...`，那些不能删）。
