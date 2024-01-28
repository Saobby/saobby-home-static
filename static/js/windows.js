function confirm(title, content){
    return new Promise(function(resolve, reject){
        var dialog = (function(){
            var dialog = document.createElement("dialog");
            dialog.setAttribute("class", "wux-dialog");
            dialog.innerHTML = `<div class="wux-dialog-header"><h1 class="wux-dialog-header-title">${title}</h1></div><div class="wux-dialog-body">${content}</div>`;
            dialog.appendChild((function(){
                var footer = document.createElement("div");
                footer.setAttribute("class", "wux-dialog-footer");
                footer.appendChild((function(){
                    var fg = document.createElement("div");
                    fg.setAttribute("class", "wux-dialog-footer-group");
                    fg.appendChild((function(){
                        var btn = document.createElement("button");
                        btn.setAttribute("class", "wux-btn wux-btn-primary wux-btn-outline");
                        btn.setAttribute("type", "button");
                        btn.innerHTML = `${icon_with_text("x-primary", "取消")}`;
                        btn.addEventListener("click", function(event){
                            dialog.close();
                            gebi("windows-div").removeChild(dialog);
                            resolve(false);
                        });
                        return btn;
                    })());
                    fg.appendChild((function(){
                        var btn = document.createElement("button");
                        btn.setAttribute("class", "wux-btn wux-btn-primary simple");
                        btn.setAttribute("type", "button");
                        btn.innerHTML = `${icon_with_text("check-white", "确定")}`;
                        btn.addEventListener("click", function(event){
                            dialog.close();
                            gebi("windows-div").removeChild(dialog);
                            resolve(true);
                        });
                        return btn;
                    })());
                    return fg;
                })());
                return footer;
            })());
            dialog.addEventListener("keydown", function(event){
                if (event.keyCode === 27){
                    event.keyCode = 0;
                    event.returnValue = false;
                }
            });
            return dialog;
        })();
        gebi("windows-div").appendChild(dialog);
        dialogPolyfill.registerDialog(dialog);
        dialog.showModal();
    });
}

function prompt(title, content, must_fill){
    return new Promise(function(resolve, reject){
        var dialog = (function(){
            var dialog = document.createElement("dialog");
            dialog.setAttribute("class", "wux-dialog");
            dialog.innerHTML = `<div class="wux-dialog-header"><h1 class="wux-dialog-header-title">${title}</h1></div>`;
            var input = document.createElement("textarea");
            input.setAttribute("class", "wux-form-input wux-form-input-md");
            input.setAttribute("style", "height:100px;");
            dialog.appendChild((function(){
                var body = document.createElement("div");
                body.setAttribute("class", "wux-dialog-body");
                body.innerHTML = `<span>${content}</span>`;
                body.appendChild(input);
                return body;
            })());
            dialog.appendChild((function(){
                var footer = document.createElement("div");
                footer.setAttribute("class", "wux-dialog-footer");
                var result = document.createElement("span");
                result.setAttribute("class", "result");
                result.innerHTML = "";
                footer.appendChild(result);
                footer.appendChild((function(){
                    var fg = document.createElement("div");
                    fg.setAttribute("class", "wux-dialog-footer-group");
                    fg.appendChild((function(){
                        var btn = document.createElement("button");
                        btn.setAttribute("class", "wux-btn wux-btn-primary wux-btn-outline");
                        btn.setAttribute("type", "button");
                        btn.innerHTML = `${icon_with_text("x-primary", "取消")}`;
                        btn.addEventListener("click", function(event){
                            dialog.close();
                            gebi("windows-div").removeChild(dialog);
                            resolve(null);
                        });
                        return btn;
                    })());
                    fg.appendChild((function(){
                        var btn = document.createElement("button");
                        btn.setAttribute("class", "wux-btn wux-btn-primary simple");
                        btn.setAttribute("type", "button");
                        btn.innerHTML = `${icon_with_text("check-white", "确定")}`;
                        btn.addEventListener("click", function(event){
                            if (must_fill && input.value === ""){
                                result.innerHTML = "不能为空";
                                return;
                            }
                            dialog.close();
                            gebi("windows-div").removeChild(dialog);
                            resolve(input.value);
                        });
                        return btn;
                    })());
                    return fg;
                })());
                return footer;
            })());
            dialog.addEventListener("keydown", function(event){
                if (event.keyCode === 27){
                    event.keyCode = 0;
                    event.returnValue = false;
                }
            });
            return dialog;
        })();
        gebi("windows-div").appendChild(dialog);
        dialogPolyfill.registerDialog(dialog);
        dialog.showModal();
    });
}