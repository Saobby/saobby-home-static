var selected_tab_class = "wux-btn";
var not_selected_tab_class = "wux-btn wux-btn-outline";

function init_tab(){
    var tabs = gebcn("tab-btn");
    var tab_divs = gebcn("tab-div");
    for (var i = 0; i < tabs.length; i++){
        var tab = tabs[i];
        tab.setAttribute("onclick", tab.getAttribute("execute")?"click_tab(this);"+tab.getAttribute("execute"):"click_tab(this);");
        if (tab.getAttribute("selected") === null){
            tab.setAttribute("class", not_selected_tab_class+" tab-btn");
            for (var j=0;j<tab_divs.length;j++){
                var tab_div = tab_divs[j];
                if (tab.getAttribute("group-id") === tab_div.getAttribute("group-id") &&
                    tab.getAttribute("child-id") === tab_div.getAttribute("child-id")
                ){
                    tab_div.hidden = true;
                }
            }
        }else{
            tab.setAttribute("class", selected_tab_class+" tab-btn");
            for (var j=0;j<tab_divs.length;j++){
                var tab_div = tab_divs[j];
                if (tab.getAttribute("group-id") === tab_div.getAttribute("group-id") &&
                    tab.getAttribute("child-id") === tab_div.getAttribute("child-id")
                ){
                    tab_div.hidden = false;
                }
            }
        }
    }

}

function click_tab(ele){
    var group_id = ele.getAttribute("group-id");
    var child_id = ele.getAttribute("child-id");
    var tabs = gebcn("tab-btn");
    var tab_divs = gebcn("tab-div");
    for (var i=0; i < tabs.length; i++){
        var tab = tabs[i];
        if (tab.getAttribute("group-id") === group_id){
            if (tab.getAttribute("child-id") === child_id){
                tab.setAttribute("class", selected_tab_class+" tab-btn");
                tab.setAttribute("selected", "");
            }else{
                tab.setAttribute("class", not_selected_tab_class+" tab-btn");
                tab.removeAttribute("selected");
            }
        }
    }
    for (var j=0; j < tab_divs.length; j++){
        var tab_div = tab_divs[j];
        if (tab_div.getAttribute("group-id") === group_id){
            if (tab_div.getAttribute("child-id") === child_id){
                tab_div.hidden = false;
            }else{
                tab_div.hidden = true;
            }
        }
    }
}

init_tab();
