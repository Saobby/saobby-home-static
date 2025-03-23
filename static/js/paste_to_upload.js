// 图片粘贴上传、图片上传按钮
var textarea_map = {};
let spark_loaded = false;
var pasteToUpload = (function(api_url, blob_api_domain){
    gebi("upload-image-progress-div").innerHTML = `<div id="upload-image-progress-window" style="position:fixed;top:calc(50vh - 90px);left:calc(50vw - 200px);width:400px;height:180px;background:#ffffff;white-space:normal;" class="pre-like" hidden><h2>正在上传图片...</h2><progress id="upload-image-progress-bar" class="wux-progress" value="0" max="100"></progress><span>上传进度:<span id="upload-image-progress">0</span>%</span><br><span id="upload-image-cancel-div"></span><span class="result" id="upload-image-result" style="margin-left:5px;"></span><input type="hidden" id="upload-image-status" value="closed"></div>`;
    
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

    function init_progress_bar(cancel){
        gebi("upload-image-progress-window").hidden = false;
        gebi("upload-image-progress-bar").value = 0;
        gebi("upload-image-progress").innerHTML = "0";
        gebi("upload-image-result").innerHTML = "";
        var cancel_btn_id = `upload-image-cancel-btn-${Math.random()}`;
        gebi("upload-image-cancel-div").innerHTML = `<button class="wux-btn wux-btn-primary wux-btn-outline right" id="${cancel_btn_id}">${icon_with_text("x-primary", "取消")}</button>`;
        gebi(cancel_btn_id).addEventListener("click", cancel, {"once": true});
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
                
                gebi("upload-image-status").value = "uploading";
                init_progress_bar(function(){
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
                });
                
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

    async function upload_file(file, textarea, no_tips){
        function get_file_md5(file){
            var promise = new Promise(function(resolve, reject){
                function loadNext() {
                    var start = currentChunk * chunkSize,
                        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
                }
                var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                    chunkSize = 2097152,                             // Read in chunks of 2MB
                    chunks = Math.ceil(file.size / chunkSize),
                    currentChunk = 0,
                    spark = new SparkMD5.ArrayBuffer(),
                    fileReader = new FileReader();
                fileReader.onload = function (e) {
                    spark.append(e.target.result);                   // Append array buffer
                    currentChunk++;
                    if (currentChunk < chunks) {
                        loadNext();
                    } else {
                        resolve(spark.end());
                    }
                };
                fileReader.onerror = function () {
                    reject(null);
                };
                loadNext();
            });
            return promise;
        }

        function set_textarea_tips(text){
            insert_into_textarea(text, textarea);
            textarea.readOnly = false;
        }

        if (gebi("upload-image-status").value !== "closed"){
            set_textarea_tips("(无法上传文件,因为有一个正在进行的上传任务)");
            return {"success": false, "message": "无法上传文件,因为有一个正在进行的上传任务"};
        }

        textarea.readOnly = true;
        gebi("upload-image-status").value = "calculating_md5";

        if (!spark_loaded){
            await load_script("/static/js/spark-md5.min.js");
            spark_loaded = true;
        }
        const md5 = await get_file_md5(file);

        gebi("upload-image-status").value = "captcha_verifying";

        const captcha_rsp = await captcha_v3();
        if (captcha_rsp.retcode){
            set_textarea_tips("(无法上传文件,人机验证失败:"+captcha_rsp.msg+")");
            gebi("upload-image-status").value = "closed";
            return {"success": false, "message": "无法上传文件,人机验证失败:"+captcha_rsp.msg};
        }

        gebi("upload-image-status").value = "getting_upload_url";

        const rsp1 = await fetch_api(blob_api_domain+"/api/gen_upload_args", {"captcha_token": captcha_rsp.data.token, "md5": md5});
        if (rsp1.retcode){
            set_textarea_tips("(无法上传文件,获取上传参数失败:"+rsp1.msg+")");
            gebi("upload-image-status").value = "closed";
            return {"success": false, "message": "无法上传文件,获取上传参数失败:"+rsp1.msg};
        }

        gebi("upload-image-status").value = "uploading";

        const form_data = new FormData();
        Object.keys(rsp1.data.args).forEach(function(key){
            form_data.append(key, rsp1.data.args[key]);
        });
        form_data.append("file", file);
        
        const form_submitter = new LargeFormSubmitter(rsp1.data.url, form_data, function(percentage){
            if (percentage === 100){
                gebi("upload-image-result").innerHTML = "正在处理...";
                return;
            }
            gebi("upload-image-progress-bar").value = percentage;
            gebi("upload-image-progress").innerHTML = Math.floor(percentage).toString();
        });
        rsp2 = await form_submitter.send();

        if (rsp2.status === -1){
            set_textarea_tips("(无法上传文件:网络错误)");
            gebi("upload-image-status").value = "closed";
            return {"success": false, "message": "无法上传文件:网络错误"};
        }
        if (rsp2.status === -2){
            set_textarea_tips("(无法上传文件:操作被用户取消)");
            gebi("upload-image-status").value = "closed";
            return {"success": false, "message": "无法上传文件:操作被用户取消"};
        }

        const xml_parser = new DOMParser();
        const xml = xml_parser.parseFromString(rsp2.response, "text/xml");
        if (rsp2.status !== 200){
            const err_msg = xml.getElementsByTagName("Error")[0].getElementsByTagName("Message")[0].textContent;
            set_textarea_tips("(无法上传文件,上传失败:"+err_msg+")");
            gebi("upload-image-status").value = "closed";
            return {"success": false, "message": "无法上传文件,上传失败:"+err_msg};
        }

        const rsp3 = await fetch_api(blob_api_domain+"/api/finish_upload", {"key": rsp1.data.key});
        if (rsp3.retcode){
            set_textarea_tips("(文件上传失败:"+rsp3.msg+")");
            gebi("upload-image-status").value = "closed";
            return {"success": false, "message": "文件上传失败:"+rsp3.msg};
        }
        set_textarea_tips(`![@File](blob:${rsp3.data.key} '${file.name}')`);
        gebi("upload-image-status").value = "closed";
        return {"success": true, "message": "OK"};
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
            case 2:
                gebi(`upload-file-btn-input-${bid}`).click();
                break;
            case 3:
                var file = gebi(`upload-file-btn-input-${bid}`).files[0];
                if (!file){
                    return;
                }
                gebi(`upload-file-btn-input-${bid}`).value = "";
                const btn2 = gebi(`upload-file-btn-${bid}`);
                set_btn_html(btn2, "...");
                try{
                    await upload_file(file, gebi(textarea_map[bid]), true);
                }catch(e){
                    throw e;
                }finally{
                    set_btn_html(btn2);
                }
                break;
        }
    }
    returns.gen_upload_btn = function(textarea, size){
        var btn_id = Math.random();
        textarea_map[btn_id] = textarea;
        let ret = `<input type="file" accept="image/*" id="upload-btn-input-${btn_id}" onchange="pasteToUpload._upload_btn(${btn_id},1).then();" hidden><button type="button" id="upload-btn-${btn_id}" class="wux-btn wux-btn-success wux-btn-${size} wux-btn-text icon-btn simple" onclick="pasteToUpload._upload_btn(${btn_id},0).then();">${icon_with_text("photo-up-success", "", 24)}</button>`;
        ret += `<input type="file" accept="*/*" id="upload-file-btn-input-${btn_id}" onchange="pasteToUpload._upload_btn(${btn_id},3).then();" hidden><button type="button" id="upload-file-btn-${btn_id}" class="wux-btn wux-btn-info wux-btn-${size} wux-btn-text icon-btn simple" onclick="pasteToUpload._upload_btn(${btn_id},2).then();">${icon_with_text("photo-up-primary", "", 24)}</button>`;
        return ret;
    }
    
    return returns;
})("https://image.saobby.com/api/upload_image", "https://blob.saobby.com");
pasteToUpload.init();
