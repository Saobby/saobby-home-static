var domain="https://aether.saobby.com:5002";function upload_avatar(){void 0!==gebi("avatar_img_file").files[0]?(get_captcha_img(),gebi("captcha-window").hidden=!1):gebi("upload_result").innerHTML="你未选择任何文件"}function set_avatar(){if(""!=(e=gebi("avatar_url").value)){gebi("save-btn").disabled=!0,gebi("save-btn").innerHTML="请稍候";var e=gebi("avatar_url").value,t=new XMLHttpRequest;t.open("POST",domain+"/api/set_avatar_url",!0),t.setRequestHeader("Content-Type","application/json");var n={avatar_url:e,access_token:localStorage.getItem("access-token")};t.send(JSON.stringify(n)),t.onreadystatechange=function(){4==t.readyState&&(ret_json=JSON.parse(t.responseText),ret_json.success?window.location="/":(gebi("save-btn").disabled=!1,gebi("save-btn").innerHTML="保存",gebi("set_result").innerHTML=ret_json.message))}}else gebi("set_result").innerHTML="头像链接不能为空!"}function complete_captcha(){gebi("upload-btn").innerHTML="上传中",gebi("upload-btn").disabled=!0;var e=gebi("avatar_img_file").files[0],t=gebi("captcha-token").value,n=new FormData,a=new XMLHttpRequest;a.open("post","https://saobbyggusercontent.pythonanywhere.com/api/upload_image",!0),a.onreadystatechange=function(){4==this.readyState&&(ret_json=JSON.parse(this.responseText),ret_json.success&&(gebi("avatar_url").value=ret_json.data.image_url,gebi("avatar_img").src=ret_json.data.image_url),gebi("upload_result").innerHTML=ret_json.message,gebi("upload-btn").innerHTML="上传",gebi("upload-btn").disabled=!1)},a.upload.onprogress=function(e){if(e.lengthComputable){var t=100*e.loaded/e.total;gebi("upload_result").innerHTML=100==t?"正在处理...":"上传中("+Math.floor(t)+"%)"}},n.append("image",e),n.append("captcha_token",t),a.send(n)}null==localStorage.getItem("access-token")&&(localStorage.login_redirect=window.location.href,window.location="/login");
