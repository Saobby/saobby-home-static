domain="https://api-ry.saobby.com/mys-picbed-api";
function s0(){
    if (!(gebi("image_file").files[0])){
        gebi("upload_result").innerHTML = "你未选择任何文件";
        return;
    }
    gebi("upload-btn").disabled = true;
    gebi("image_file").disabled = true;
    gebi("upload_result").innerHTML = "正在计算文件MD5";
    get_file_md5();
}
function s1(file_md5){
    console.log(file_md5);
    req_data  = {"file_md5": file_md5,
                 "file_type": (function (){
                     var name=gebi("image_file").files[0].name.split(".");
                     return name[name.length-1];
                     })(),
                 "captcha_token": ""
                 };
    gebi("upload_result").innerHTML = "正在获取上传参数";
    gebi("captcha-window").hidden = false;
    get_captcha_img();
}
function complete_captcha(){
    req_data["captcha_token"] = gebi("captcha-token").value;
    var req = new XMLHttpRequest;
    req.open("POST", domain + "/api/get_args", !0);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(req_data));
    req.onreadystatechange = function() {
        if (req.readyState === 4) {
            var t = JSON.parse(req.responseText);
            if (t.success){
                console.log(t.data);
                s2(t.data);
            }else{
                gebi("upload-btn").disabled = false;
                gebi("image_file").disabled = false;
                gebi("upload_result").innerHTML = t.message;
            }
        }
    }
}

function s2(req_data){
    var form = new FormData;
    var req = new XMLHttpRequest;
    req.open("post", req_data["url"], !0);
    req.onreadystatechange = function() {
        if (req.readyState === 4){
            gebi("upload-btn").disabled = false;
            gebi("image_file").disabled = false;
            if (req.status === 200){
                var ret_json = JSON.parse(req.responseText);
                if (ret_json.retcode===0){
                    gebi("upload_result").innerHTML = "上传成功";
                    gebi("file_url").value = ret_json.data.url;
                    gebi("markdown").value = "![](" + ret_json.data.url + ")";
                }else{
                    gebi("upload_result").innerHTML = ret_json.msg;
                }
            }else{
                gebi("upload_result").innerHTML = "上传失败!可能是因为文件过大"
            }
        }
    };
    req.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            var t = 100 * e.loaded / e.total;
            gebi("upload_result").innerHTML = 100 == t ? "等待服务端响应" : "上传中(" + Math.floor(t) + "%)";
        }
    };
    var order = ["name", "key", "callback", "success_action_status", "x:extra", "x-oss-content-type", "OSSAccessKeyId", "policy", "signature"];
    for (var i=0;i<order.length;i++){
        form.append(order[i], req_data[order[i]]);
    }
    form.append("file", gebi("image_file").files[0]);
    req.send(form);
}

function gebi(e){
    return document.getElementById(e);
}

function get_file_md5(){
    var ele = gebi("image_file");
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        file = ele.files[0],
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
//            console.info('computed hash', spark.end());  // Compute hash
            s1(spark.end());
        }
    };

    fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
    };

    function loadNext() {
        var start = currentChunk * chunkSize,
            end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }

    loadNext();
}
