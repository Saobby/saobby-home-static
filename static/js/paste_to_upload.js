// 图片粘贴上传、图片上传按钮
var textarea_map = {};
var pasteToUpload = (function(api_url){
    gebi("upload-image-progress-div").innerHTML = `<div id="upload-image-progress-window" style="position:fixed;top:calc(50vh - 90px);left:calc(50vw - 200px);width:400px;height:180px;background:#ffffff;white-space:normal;" class="pre-like" hidden><h2>正在上传图片...</h2><progress id="upload-image-progress-bar" class="wux-progress" value="0" max="100"></progress><span>上传进度:<span id="upload-image-progress">0</span>%</span><br><span id="upload-image-cancel-div"></span><span class="result" id="upload-image-result" style="margin-left:5px;"></span><input type="hidden" id="upload-image-status" value="closed"></div>`;
    
    var returns = {};

    async function upload_images(event){
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                var image_file = items[i].getAsFile();
                await upload_image(image_file, this);
            }
        }
    }

    async function upload_image(image_file, textarea){
        return new Promise(function(resolve, reject){
            if (gebi("upload-image-status").value !== "closed"){
                insert_into_textarea("(无法上传图片,因为有一个正在进行的上传任务)", textarea);
                reject({"message": "无法上传图片,因为有一个正在进行的上传任务"});
                return;
            }
            saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
                gebi("upload-image-progress-window").hidden = false;
                gebi("upload-image-progress-bar").value = 0;
                gebi("upload-image-progress").innerHTML = "0";
                gebi("upload-image-result").innerHTML = "";
                gebi("upload-image-status").value = "uploading";
                var cancel_btn_id = `upload-image-cancel-btn-${Math.random()}`;
                gebi("upload-image-cancel-div").innerHTML = `<button class="wux-btn wux-btn-primary wux-btn-outline" id="${cancel_btn_id}">${icon_with_text("x-primary", "取消")}</button>`;
                gebi(cancel_btn_id).addEventListener("click", function(){
                    gebi("upload-image-progress-window").hidden = true;
                    if (gebi("upload-image-status").value === "uploading"){
                        http.abort();
                        gebi("upload-image-status").value = "closed";
                        reject({"message": "操作被用户取消"});
                    }
                    gebi("upload-image-status").value = "closed";
                }, {"once": true});
                var form_data = new FormData;
                var http = new XMLHttpRequest;
                http.open("post", api_url, true);
                http.onreadystatechange = function(){
                    if (this.readyState === 4){
                        var ret = JSON.parse(this.responseText);
                        if (ret.success){
                            insert_into_textarea("![](" + ret.data.image_url + ")", textarea);
                            gebi("upload-image-progress-window").hidden = true;
                            gebi("upload-image-status").value = "closed";
                            resolve({"message": ret.message});
                        }else{
                            gebi("upload-image-result").innerHTML = ret.message;
                            gebi("upload-image-status").value = "onerror";
                            reject({"message": ret.message});
                        }
                    }
                };
                http.upload.onprogress = function(t){
                    if (t.lengthComputable){
                        var percentage = 100 * t.loaded / t.total;
                        if (percentage === 100){
                            gebi("upload-image-result").innerHTML = "正在处理...";
                        }
                        gebi("upload-image-progress").innerHTML = Math.floor(percentage).toString();
                        gebi("upload-image-progress-bar").value = percentage;
                    }
                };
                http.onerror = function(){
                    gebi("upload-image-result").innerHTML = "网络错误";
                    gebi("upload-image-status").value = "onerror";
                    reject({"message": "网络错误"});
                }
                form_data.append("image", image_file);
                form_data.append("captcha_token", val.captcha_token);
                http.send(form_data);
            }, function(val){
                insert_into_textarea("(无法上传图片,请先完成人机验证:"+val.message+")", textarea);
                reject({"message": "无法上传图片,请先完成人机验证:"+val.message});
            });
        });
    }

    returns.init = function(){
        var textareas = gebcn("marked-textarea");
        for (var i=0; i<textareas.length;i++){
            var textarea = textareas[i];
            if (textarea.getAttribute("ptu_patched") === null){
                textarea.addEventListener("paste", upload_images);
                textarea.setAttribute("ptu_patched", "");
            }
        }
    }
    // markdown编辑器 图片上传按钮功能
    returns._upload_btn = async function(bid, step){
        switch (step){
            case 0:
                gebi(`upload-btn-input-${bid}`).click();
                break;
            case 1:
                var file = gebi(`upload-btn-input-${bid}`).files[0];
                if (!file){
                    return;
                }
                await upload_image(file, gebi(textarea_map[bid]));
                break;
        }
    }
    returns.gen_upload_btn = function(textarea, size){
        var btn_id = Math.random();
        textarea_map[btn_id] = textarea;
        return `<input type="file" accept="image/*" id="upload-btn-input-${btn_id}" onchange="pasteToUpload._upload_btn(${btn_id},1).then();" hidden><button type="button" class="wux-btn wux-btn-success wux-btn-${size} wux-btn-outline simple" onclick="pasteToUpload._upload_btn(${btn_id},0).then();">${icon_with_text("photo-up-success", "上传图片")}</button>`;
    }
    
    return returns;
})("https://upload-static.saobby.com/api/upload_image");
pasteToUpload.init();
