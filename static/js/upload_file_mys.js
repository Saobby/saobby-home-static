function s0(){gebi("image_file").files[0]?(gebi("upload-btn").disabled=!0,gebi("image_file").disabled=!0,gebi("upload_result").innerHTML="正在计算文件MD5",get_file_md5()):gebi("upload_result").innerHTML="你未选择任何文件"}function s1(e){var a;console.log(e),req_data={file_md5:e,file_type:(a=gebi("image_file").files[0].name.split("."),a[a.length-1]),captcha_token:""},gebi("upload_result").innerHTML="正在获取上传参数",gebi("captcha-window").hidden=!1,get_captcha_img()}function complete_captcha(){req_data.captcha_token=gebi("captcha-token").value;var e=new XMLHttpRequest;e.open("POST",domain+"/api/get_args",!0),e.setRequestHeader("Content-Type","application/json"),e.send(JSON.stringify(req_data)),e.onreadystatechange=function(){if(4===e.readyState){var a=JSON.parse(e.responseText);a.success?(console.log(a.data),s2(a.data)):(gebi("upload-btn").disabled=!1,gebi("image_file").disabled=!1,gebi("upload_result").innerHTML=a.message)}}}function s2(e){var a=new FormData,i=new XMLHttpRequest;i.open("post",e.url,!0),i.onreadystatechange=function(){if(4===i.readyState)if(gebi("upload-btn").disabled=!1,gebi("image_file").disabled=!1,200===i.status){var e=JSON.parse(i.responseText);0===e.retcode?(gebi("upload_result").innerHTML="上传成功",gebi("file_url").value=e.data.url,gebi("markdown").value="![]("+e.data.url+")"):gebi("upload_result").innerHTML=e.msg}else gebi("upload_result").innerHTML="上传失败!可能是因为文件过大"},i.upload.onprogress=function(e){if(e.lengthComputable){var a=100*e.loaded/e.total;gebi("upload_result").innerHTML=100==a?"等待服务端响应":"上传中("+Math.floor(a)+"%)"}};for(var t=["name","key","callback","success_action_status","x:extra","x-oss-content-type","OSSAccessKeyId","policy","signature"],n=0;n<t.length;n++)a.append(t[n],e[t[n]]);a.append("file",gebi("image_file").files[0]),i.send(a)}function gebi(e){return document.getElementById(e)}function get_file_md5(){var e=gebi("image_file"),a=File.prototype.slice||File.prototype.mozSlice||File.prototype.webkitSlice,i=e.files[0],t=2097152,n=Math.ceil(i.size/t),l=0,o=new SparkMD5.ArrayBuffer,s=new FileReader;function r(){var e=l*t,n=e+t>=i.size?i.size:e+t;s.readAsArrayBuffer(a.call(i,e,n))}s.onload=function(e){o.append(e.target.result),++l<n?r():s1(o.end())},s.onerror=function(){console.warn("oops, something went wrong.")},r()}domain="https://api-ry.saobby.com/mys-picbed-api";