var headers = {"Content-Type": "application/json"};

function gebi(eleid){
    return document.getElementById(eleid);
}

function gebcn(class_name){
    return document.getElementsByClassName(class_name);
}

function fetch_data(url, method, headers, data){
    var promise = new Promise(function(resolve, reject){
        var http = new XMLHttpRequest;
        http.open(method, url, true);
        for (var header in headers){
            http.setRequestHeader(header, headers[header]);
        }
        try{
            if (method === "GET"){
                http.send();
            }else{
                http.send(data);
            }
        }catch(error){
            reject({"message": error.name+error.message});
        }
        http.onreadystatechange = function(){
            if (http.readyState === 4){
                if (http.status === 0){
                    reject({"message": "网络错误"})
                }else{
                    resolve({"response_text": http.responseText, "status_code": http.status});
                }
            }
        }
        http.onerror = function(){
            reject({"message": "网络错误"});
        }
    });
    return promise;
}
function is_in(chr, str){
    for (var t in str){
        if (chr === str[t]){
            return true;
        }
    }
    return false;
}
function include(ele, list){
    for (var e = 0;e < list.length;e++){
        if (ele === list[e]){
            return true;
        }
    }
    return false;
}
