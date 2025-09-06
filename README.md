# saobby-home-static
[我的个人主页](https://www.saobby.com/)的前端代码，欢迎提交 `Issue` 和 `PR`!
- - - - -
部署状态:  
![](https://api.netlify.com/api/v1/badges/966c764a-ecb5-4871-94e7-e4b5f2e3ae01/deploy-status)
# 前端调试方法
`v2`目录下的内容是用 vue 编写的。要调试它，你需要:  
1. `cd` 到 `v2` 目录
2. 安装依赖
3. 由于你没有后端，所以你要把 `v2/.env.development` 里面的 API 域名都替换成 `v2/.env.production` 里的域名
4. 输入 `npm run dev` 启动开发服务器
5. 浏览器打开 `http://127.0.0.1:5173/` 会发现报错 404 ，实际上你需要打开 `http://127.0.0.1:5173/src/pages/xxxxxx/` 才能看到 `v2/src/pages/` 下的页面, 比如 `http://127.0.0.1:5173/src/pages/home/` 会显示首页
