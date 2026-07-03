// 图片粘贴上传、图片上传按钮
var textarea_map = {};
var pasteToUpload = (function(api_url){
    gebi("upload-image-progress-div").innerHTML = `<div id="upload-image-progress-window" style="position:fixed;top:calc(50vh - 90px);left:calc(50vw - 200px);width:400px;height:180px;white-space:normal;" class="pre-like" hidden><h2>正在上传图片...</h2><progress id="upload-image-progress-bar" class="wux-progress" value="0" max="100"></progress><span>上传进度:<span id="upload-image-progress">0</span>%</span><br><span id="upload-image-cancel-div"></span><span class="result" id="upload-image-result" style="margin-left:5px;"></span><input type="hidden" id="upload-image-status" value="closed"></div>`;
    
    var returns = {};

    async function upload_images(event){
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        let prevented = false;
        for (var i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith("image/")) {
                if (!prevented){
                    event.preventDefault();
                    prevented = true;
                }
                const image_file = item.getAsFile();
                await upload_image(image_file, event.target);
            }
        }
    }

    async function upload_image(image_file, textarea, no_tips){
        return new Promise(function(resolve, reject){
            if (gebi("upload-image-status").value !== "closed"){
                insert_into_textarea("(无法上传图片,因为有一个正在进行的上传任务)", textarea);
                reject({"message": "无法上传图片,因为有一个正在进行的上传任务"});
                return;
            }
            textarea.readOnly = true;
            let ta_selected_range = [textarea.selectionStart, textarea.selectionEnd];
            gebi("upload-image-status").value = "captcha_verifying";
            if (!no_tips){
                ta_selected_range = insert_into_textarea_position("(上传中...)", textarea, ta_selected_range[0], ta_selected_range[1], true);
            }
            gen_captcha_v3().verify().then(function(val){
                if (val.retcode){
                    insert_into_textarea_position("(无法上传图片,人机验证失败:"+val.msg+")", textarea, ta_selected_range[0], ta_selected_range[1]);
                    gebi("upload-image-status").value = "closed";
                    textarea.readOnly = false;
                    reject({"message": "无法上传图片,人机验证失败:"+val.msg});
                    return;
                }
                gebi("upload-image-progress-window").hidden = false;
                gebi("upload-image-progress-bar").value = 0;
                gebi("upload-image-progress").innerHTML = "0";
                gebi("upload-image-result").innerHTML = "";
                gebi("upload-image-status").value = "uploading";
                var cancel_btn_id = `upload-image-cancel-btn-${Math.random()}`;
                gebi("upload-image-cancel-div").innerHTML = `<button class="wux-btn wux-btn-primary wux-btn-outline right" id="${cancel_btn_id}">${icon_with_text("x-primary", "取消")}</button>`;
                gebi(cancel_btn_id).addEventListener("click", function(){
                    gebi("upload-image-progress-window").hidden = true;
                    if (!no_tips){
                        insert_into_textarea_position("", textarea, ta_selected_range[0], ta_selected_range[1]);
                    }
                    if (gebi("upload-image-status").value === "uploading"){
                        http.abort();
                        gebi("upload-image-status").value = "closed";
                        textarea.readOnly = false;
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
                            insert_into_textarea_position("![](" + ret.data.image_url + ")", textarea, ta_selected_range[0], ta_selected_range[1]);
                            gebi("upload-image-progress-window").hidden = true;
                            gebi("upload-image-status").value = "closed";
                            textarea.readOnly = false;
                            resolve({"message": ret.message});
                        }else{
                            insert_into_textarea_position("(上传失败:"+ret.message+")", textarea, ta_selected_range[0], ta_selected_range[1]);
                            gebi("upload-image-result").innerHTML = ret.message;
                            gebi("upload-image-status").value = "onerror";
                            textarea.readOnly = false;
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
                    textarea.readOnly = false;
                    reject({"message": "网络错误"});
                }
                form_data.append("image", image_file);
                form_data.append("captcha_token", val.data.token);
                http.send(form_data);
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
                gebi(`upload-btn-input-${bid}`).value = "";
                const btn = gebi(`upload-btn-${bid}`);
                set_btn_html(btn, "...");
                try{
                    await upload_image(file, gebi(textarea_map[bid]), true);
                }catch(e){
                    throw e;
                }finally{
                    set_btn_html(btn);
                }
                break;
        }
    }
    returns.gen_upload_btn = function(textarea, size){
        var btn_id = Math.random();
        textarea_map[btn_id] = textarea;
        return `<input type="file" accept="image/*" id="upload-btn-input-${btn_id}" onchange="pasteToUpload._upload_btn(${btn_id},1).then();" hidden><button type="button" id="upload-btn-${btn_id}" class="wux-btn wux-btn-success wux-btn-${size} wux-btn-text icon-btn simple" onclick="pasteToUpload._upload_btn(${btn_id},0).then();">${icon_with_text("photo-up-success", "", 24)}</button>`;
    }
    
    return returns;
})("https://picbed-v3.saobby.com/api/upload_image");
pasteToUpload.init();
