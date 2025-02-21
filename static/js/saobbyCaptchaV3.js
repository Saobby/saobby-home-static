class SaobbyCaptchaV3{
    #id;
    #container
    #elements;
    #requestHeaders;
    #challengeId;
    #pos;
    #nextNumber;
    #verifyResult;
    #triggerVerifyFunc
    #icons;
    #destroyed;
    #autoCreateContainer;

    constructor(options){
        if (typeof(options) !== "object"){
            throw new Error("请传入正确的配置");
        }
        this.apiBaseUrl = options.apiBaseUrl;
        if (this.apiBaseUrl === undefined){
            throw new Error("请配置 API 域名");
        }
        this.showTrigger = options.showTrigger;
        if (this.showTrigger === undefined){
            this.showTrigger = false;
        }
        this.#container = options.container;
        this.#autoCreateContainer = false;
        if (!this.#container){
            if (this.showTrigger){
                throw new Error("在启用了触发框时，您必须配置一个用于放置触发框的容器");
            }else{
                this.#container = document.createElement("div");
                document.body.appendChild(this.#container);
                this.#autoCreateContainer = true;
            }
        }
        this.once = options.once;
        if (this.once === undefined){
            this.once = false;
        }
        if (this.showTrigger && this.once){
            throw new Error("在启用了触发框时，您不能启用自动销毁");
        }

        this.#id = Math.random().toString(36).substr(2);
        this.#requestHeaders = {"content-type": "application/json"};
        this.#nextNumber = 1;
        this.#pos = [];
        this.#verifyResult = {};
        this.#destroyed = false;

        this.#initIcons();
        this.#initDOM();
        this.#bindEvents();
    }

    #gebi(eleid){
        return document.getElementById(eleid);
    }

    #iconWithText(icon_name, text){
        let html = this.#icons[icon_name];
        if (text){
            html += `<span class="SCV3-middle">${text}</span>`;
        }
        return html;
    }

    #setButtonHTML(ele, html){
        if (html){
            const loading_words = ["请稍候", "...", "正在上传"];
            for (let i in loading_words){
                const t = loading_words[i];
                html = html.replaceAll(t, '<span class="SCV3-loading"></span>');
            }
            if (!ele.getAttribute("old_html")){
                ele.setAttribute("old_html", ele.innerHTML);
            }
            ele.innerHTML = html;
            ele.disabled = true;
        }else{
            if (ele.getAttribute("old_html")){
                ele.innerHTML = ele.getAttribute("old_html");
                ele.removeAttribute("old_html");
            }
            ele.disabled = false;
        }
    }

    #watch(obj, prop){
        return new Promise(resolve => {
            let value = obj[prop];

            Object.defineProperty(obj, prop, {
                get() {
                    return value;
                },
                set(newValue) {
                    value = newValue;
                    resolve(newValue);
                },
                configurable: true
            });
        });
    }

    async #fetchAPI(url, method, data){
        try{
            const response = await fetch(url, {
                method: method,
                headers: this.#requestHeaders,
                body: JSON.stringify(data)
            });
            return await response.json();
        }catch(error){
            return {retcode: -1, msg: "网络错误", data: null};
        }
    }

    #putNumberMark(number, x, y){
        const ele = this.#elements.numberMarks[number-1];
        ele.style.left = x - 16 + "px";
        ele.style.top = y - 16 + "px";
        ele.hidden = false;
        ele.offsetHeight;
        this.#pos.push([x, y]);
        this.#updateSubmitButtonStatus();
    }

    #clearNumberMark(number){
        for (let n=number; n<=9; n++){
            this.#elements.numberMarks[n-1].hidden = true;
        }
        this.#pos = this.#pos.slice(0, number-1);
        this.#nextNumber = number;
        this.#updateSubmitButtonStatus();
    }

    #initIcons(){
        this.#icons = {
            "check": `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="SCV3-icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" /></svg>`,
            "refresh": `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="SCV3-icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>`,
            "square": `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="SCV3-icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /></svg>`,
            "x": `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="SCV3-icon"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`
        };
    }

    #initDOM(){
        this.#container.innerHTML = `
        <style>
        .SCV3-window{
            padding: 8px 8px;
            overflow-wrap: break-word;
            border: 2px solid #ccc;
            border-radius: 12px;
            background-color: #fff;
            z-index: 1001;
        }
        .SCV3-cover{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.2s ease;
            display: none;
        }
        .SCV3-cover.SCV3-show {
            display: flex;
            opacity: 1;
        }
        .SCV3-trigger{
            padding: 12px 16px;
            overflow-wrap: break-word;
            border: 2px solid #ccc;
            border-radius: 6px;
            cursor: pointer;
            width:fit-content;
        }
        .SCV3-result{
            color: #aa0000;
        }
        .SCV3-middle{
            vertical-align: middle;
        }
        .SCV3-top{
            vertical-align: top;
        }
        .SCV3-on-top{
            margin-top: -8px;
        }
        .SCV3-centered {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .SCV3-right{
            float: right;
        }
        .SCV3-simple{
            margin-right: 8px;
        }
        .SCV3-button{
            background-color: #5064e1;
            border: none;
            border-radius: 12px;
            padding: 10px 16px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s, opacity 0.2s;
        }
        .SCV3-button:hover{
            background-color: #4050b4;
        }
        .SCV3-button:disabled{
            cursor: default;
            opacity: 0.5 !important;
            background-color: #5064e1;
            cursor: not-allowed;
        }
        .SCV3-button-text{
            color: #5064e1;
            background-color: #00000000;
            transition: color 0.2s, background-color 0.2s, opacity 0.2s;
        }
        .SCV3-button-text:hover{
            color: #4050b4;
            background-color: #f0f0f0;
        }
        .SCV3-button-text:disabled{
            color: #5064e1;
            background-color: #00000000;
            cursor: not-allowed;
        }
        .SCV3-img{
            border: none;
            border-radius: 12px;
        }
        .SCV3-button-icon{
            padding: 8px 8px;
        }
        .SCV3-button-icon svg{
            width: 24px;
            height: 24px;
        }
        @keyframes spinner{
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        .SCV3-loading{
            content: "";
            display: inline-block;
            height: 1em;
            vertical-align: text-bottom;
            width: 1em;
            pointer-events: none;
            animation: 0.8s linear 0s infinite normal none running spinner;
            border-width: 3px;
            border-style: solid;
            border-color: currentcolor rgba(0, 0, 0, 0) currentcolor currentcolor;
            border-image: initial;
            border-radius: 9999px;
        }
        .SCV3-challenge-img-div{
            margin: 4px 0;
            width: 300px;
            height: 225px;
            position: relative;
            cursor: pointer;
        }
        .SCV3-number-mark{
            width: 32px;
            height: 32px;
            border: 2px solid #ccc;
            background-color: #fff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
            color: #5064e1;
            position: absolute;
            cursor: pointer;
            opacity: 1;
            transition: opacity 0.2s ease;
        }
        .SCV3-number-mark[hidden]{
            opacity: 0;
            display: flex !important;
            pointer-events: none;
        }
        .SCV3-icon{
            width: 16px;
            height: 16px;
            vertical-align: middle;
            display: inline-block;
        }
        </style>
        <div id="SCV3-trigger-${this.#id}"${this.showTrigger ? "" : " hidden"}>
            <div class="SCV3-trigger" id="SCV3-trigger-div-${this.#id}">
                <span id="SCV3-trigger-text-${this.#id}">${this.#iconWithText("square", "点击进行人机验证")}</span>
            </div>
        </div>
        <div id="SCV3-cover-${this.#id}" class="SCV3-cover" hidden>
            <div id="SCV3-window-${this.#id}" class="SCV3-window SCV3-centered">
                <span class="SCV3-top">请<b class="SCV3-result">依次</b>点击:</span>
                <img width="129px" height="30px" class="SCV3-on-top SCV3-img" id="SCV3-tip-img-${this.#id}" draggable="false">
                <div class="SCV3-challenge-img-div" id="SCV3-challenge-div-${this.#id}">
                    <img width="300" height="225" class="SCV3-img" id="SCV3-challenge-img-${this.#id}" draggable="false">
                    ${(()=>{
                        let html = "";
                        for (let i=1; i<=9; i++){
                            html += `<div class="SCV3-number-mark" id="SCV3-number-mark-${i}-${this.#id}" hidden>${i}</div>`;
                        }
                        return html;
                    })()}
                </div>
                <button class="SCV3-right SCV3-button" type="button" id="SCV3-submit-btn-${this.#id}">${this.#iconWithText("check", "确认")}</button>
                <button class="SCV3-button SCV3-button-text SCV3-button-icon" type="button" id="SCV3-close-btn-${this.#id}">${this.#iconWithText("x")}</button>
                <button class="SCV3-button SCV3-button-text SCV3-button-icon" type="button" id="SCV3-refresh-btn-${this.#id}">${this.#iconWithText("refresh")}</button>
                <span class="SCV3-result" id="SCV3-result-${this.#id}"></span>
            </div>
        </div>
        <input id="SCV3-token-${this.#id}" type="hidden" name="SCV3_token">
        `;
        this.#elements = {
            triggerDiv: this.#gebi(`SCV3-trigger-div-${this.#id}`),
            window: this.#gebi(`SCV3-window-${this.#id}`),
            cover: this.#gebi(`SCV3-cover-${this.#id}`),
            closeButton: this.#gebi(`SCV3-close-btn-${this.#id}`),
            tipImage: this.#gebi(`SCV3-tip-img-${this.#id}`),
            challengeImage: this.#gebi(`SCV3-challenge-img-${this.#id}`),
            challengeDiv: this.#gebi(`SCV3-challenge-div-${this.#id}`),
            result: this.#gebi(`SCV3-result-${this.#id}`),
            refreshButton: this.#gebi(`SCV3-refresh-btn-${this.#id}`),
            submitButton: this.#gebi(`SCV3-submit-btn-${this.#id}`),
            numberMarks: (() => {
                let marks = [];
                for (let i=1; i<=9; i++){
                    marks.push(this.#gebi(`SCV3-number-mark-${i}-${this.#id}`));
                }
                return marks;
            })(),
            tokenInput: this.#gebi(`SCV3-token-${this.#id}`)
        };
    }

    #bindEvents(){
        this.#triggerVerifyFunc = this.#triggerVerify.bind(this);
        this.#elements.triggerDiv.addEventListener("click", this.#triggerVerifyFunc);
        this.#elements.closeButton.addEventListener("click", ()=>{
            this.#cancel();
        });
        this.#elements.refreshButton.addEventListener("click", ()=>{
            this.#refreshChallenge().then();
        });
        this.#elements.challengeImage.addEventListener("click", (event)=>{
            if (this.#nextNumber > 9){
                return;
            }
            const x = event.offsetX, y = event.offsetY;
            this.#putNumberMark(this.#nextNumber, x, y);
            this.#nextNumber += 1;
        });
        for (let t=0; t<this.#elements.numberMarks.length; t++){
            this.#elements.numberMarks[t].addEventListener("click", ()=>{
                this.#clearNumberMark(t+1);
            });
        }
        this.#elements.submitButton.addEventListener("click", (event)=>{
            this.#getToken().then();
        });
    }

    async verify(){
        if (this.#destroyed){
            throw new Error("这个人机验证实例已被销毁，请重新创建实例");
        }
        this.#elements.triggerDiv.innerHTML = this.#iconWithText("square", "点击进行人机验证");
        this.#setButtonHTML(this.#elements.triggerDiv, "...");
        const result = await this.#refreshChallenge();
        if (result.retcode){
            if (result.retcode === 999){
                this.#setButtonHTML(this.#elements.triggerDiv);
                this.#setTriggerSucceeded();
                this.#elements.tokenInput.value = this.#verifyResult.result.data.token;
                this.#autoDestroy();
                return this.#verifyResult.result;
            }
            this.#setButtonHTML(this.#elements.triggerDiv);
            this.#elements.triggerDiv.innerHTML = `<span class="SCV3-result">错误:${result.msg}。请刷新页面后重试</span>`;
            this.#autoDestroy();
            return result;
        }
        this.#open();
        const ret = await this.#watch(this.#verifyResult, "result");
        this.#setButtonHTML(this.#elements.triggerDiv);
        if (!ret.retcode){
            this.#setTriggerSucceeded();
            this.#elements.tokenInput.value = this.#verifyResult.result.data.token;
        }
        this.#autoDestroy();
        return ret;
    }

    #triggerVerify(){
        this.verify().then();
    }

    async #refreshChallenge(){
        this.#setButtonHTML(this.#elements.refreshButton, "...");
        this.#elements.submitButton.disabled = true;
        const response = await this.#fetchAPI(this.apiBaseUrl+"/api/gen_challenge", "POST");
        if (response.retcode){
            this.#elements.result.innerHTML = response.msg;
            this.#setButtonHTML(this.#elements.refreshButton);
            this.#updateSubmitButtonStatus();
            return response;
        }else{
            if (response.data.token){
                this.#verifyResult.result = response;
                return {retcode: 999};
            }
            this.#elements.tipImage.src = response.data.tip;
            this.#elements.challengeImage.src = response.data.challenge;
            this.#challengeId = response.data.id;
            this.#setButtonHTML(this.#elements.refreshButton);
            this.#updateSubmitButtonStatus();
            this.#clearNumberMark(1);
            this.#elements.result.innerHTML = "";
            return {retcode: 0};
        }
    }

    async #getToken(){
        this.#setButtonHTML(this.#elements.submitButton, "...");
        this.#elements.refreshButton.disabled = true;
        this.#elements.closeButton.disabled = true;
        const response = await this.#fetchAPI(this.apiBaseUrl+"/api/get_token", "POST", {
            id_: this.#challengeId,
            pos: this.#pos
        });
        if (response.retcode){
            this.#elements.result.innerHTML = response.msg;
            if (response.retcode === 1){
                this.#refreshChallenge().then();
            }
        }else{
            this.#verifyResult.result = response;
            this.#close();
        }
        this.#setButtonHTML(this.#elements.submitButton);
        this.#elements.closeButton.disabled = false;
        this.#elements.refreshButton.disabled = false;
        this.#updateSubmitButtonStatus();
    }

    #open(){
        this.#elements.cover.style.display = "flex";
        this.#elements.cover.offsetHeight;
        this.#elements.cover.classList.add("SCV3-show");
    }

    #close(){
        const cover = this.#elements.cover;
        cover.classList.remove("SCV3-show");
        setTimeout(() => {
            cover.style.display = "none";
        }, 200);
    }

    #cancel(){
        this.#close();
        this.#verifyResult.result = {retcode: 1, msg: "用户取消了验证", data: null};
    }

    #updateSubmitButtonStatus(){
        if (this.#pos.length > 0){
            this.#elements.submitButton.disabled = false;
        }else{
            this.#elements.submitButton.disabled = true;
        }
    }

    #setTriggerSucceeded(){
        this.#elements.triggerDiv.innerHTML = this.#iconWithText("check", "验证成功");
        this.#elements.triggerDiv.removeEventListener("click", this.#triggerVerifyFunc);
        this.#elements.triggerDiv.style.cursor = "default";
    }
    
    destroy(){
        if (this.#destroyed){
            return;
        }
        if (this.#autoCreateContainer){
            this.#container.remove();
        }else{
            this.#container.innerHTML = "";
        }
        this.#destroyed = true;
    }

    #autoDestroy(){
        if (this.once){
            this.destroy();
        }
    }
}