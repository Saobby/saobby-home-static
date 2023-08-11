function gen_cp_buttons(page_index, page_amount, max_button_amount, callback, ele, selected_button_class, unselected_button_class){
    ele.innerHTML = "";
    if (page_amount <= max_button_amount){
        for (var num=1; num<=page_amount; num++){
            var btn = document.createElement("button");
            btn.innerHTML = num.toString();
            btn.setAttribute("class", num==page_index?selected_button_class:unselected_button_class);
            btn.addEventListener("click", function(event){callback(parseInt(event.target.innerHTML));});
            ele.appendChild(btn);
        }
    }else{
        var from = page_index - Math.floor(max_button_amount/2);
        var to = page_index + Math.floor(max_button_amount/2);
        if (from < 1){
            to += 1 - from;
            from = 1;
        }else if (to > page_amount){
            from -= to - page_amount;
            to = page_amount;
        }
        for (var num=from; num<=to; num++){
            var btn = document.createElement("button");
            if (num === from && num !== 1){
                btn.innerHTML = "«";
                btn.addEventListener("click", function(event){callback(1);});
            }else if(num === to && num !== page_amount){
                btn.innerHTML = "»";
                btn.addEventListener("click", function(event){callback(page_amount);});
            }else{
                btn.innerHTML = num.toString();
                btn.addEventListener("click", function(event){callback(parseInt(event.target.innerHTML));});
            }
            btn.setAttribute("class", num==page_index?selected_button_class:unselected_button_class);
            ele.appendChild(btn);
        }
    }
}