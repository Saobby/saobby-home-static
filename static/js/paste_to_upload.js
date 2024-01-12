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
                gebi("upload-image-cancel-div").innerHTML = `<button class="wux-btn wux-btn-primary wux-btn-outline" id="${cancel_btn_id}">取消</button>`;
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

    function insert_into_textarea(text, textarea){
        var start_pos = textarea.selectionStart;
        var end_pos = textarea.selectionEnd;
        var old_text = textarea.value;
        var new_text = old_text.substring(0, start_pos) + text + old_text.substring(end_pos, old_text.length);
        textarea.value = new_text;
        textarea.selectionStart = start_pos + text.length;
        textarea.selectionEnd = start_pos + text.length;
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
    return returns;
})("https://upload-static.saobby.com/api/upload_image");
pasteToUpload.init();
