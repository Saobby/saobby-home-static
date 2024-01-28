var domain = "https://comments.saobby.com";
var page_size = 8;
function load_posts(page_index){
    function set_buttons_status(status){
        gebi("sort-by-select").disabled = status;
        gebi("sort-method-select").disabled = status;
        (status?set_btn_html(gebi("search-btn"), "..."):set_btn_html(gebi("search-btn")))
        gebi("search-field").disabled = status;
        gebi("search-text").disabled = status;
        var cp_btn = gebcn("cp-btn");
        for (var a=0; a<cp_btn.length; a++){
            cp_btn[a].disabled = status;
        }
    }
    set_buttons_status(true);
    var sb_select = gebi("sort-by-select");
    var sm_select = gebi("sort-method-select");
    var sort_by = sb_select.options[sb_select.selectedIndex].value;
    var sort_method = sm_select.options[sm_select.selectedIndex].value;
    var sf_select = gebi("search-field");
    var search_field = sf_select.options[sf_select.selectedIndex].value;
    var search_text = gebi("search-text").value;
    var send_data = {"page_index": page_index, "page_size": page_size, "sort_by": sort_by, "sort_method": sort_method};
    if (search_text){
        send_data.search_field = search_field;
        send_data.search_text = search_text;
    }
    fetch_data(domain+"/api/get_posts_list", "POST", headers, JSON.stringify(send_data)).then(function(val){
        var rep = JSON.parse(val.response_text);
        if (rep.success){
            var pl_html = "";
            for (var i in rep.data.posts){
                var post = rep.data.posts[i];
                var tags_html = "";
                for (var ti in post.tags){
                    var tag = post.tags[ti];
                    tags_html += `<span class="wux-tag simple">${rsc(tag)}</span>`;
                }
                pl_html += `<div style="border-bottom: 2px solid #ddd;padding:12px 16px;"><a href="/post/?pid=${post.name}" target="_blank"><b style="font-size:20px"><span style="color:#5064E1;">${post.is_pinned?'<img src="/static/image/icon/pinned-primary.svg" width="24px" alt="[置顶]" class="middle">':""}</span><span style="color:#${post.is_closed?"AA0000":"00AA00"};">${post.is_closed?'<img src="/static/image/icon/lock-red.svg" width="24px" alt="[已关闭]" class="middle">':'<img src="/static/image/icon/circle-dot-green.svg" width="24px" alt="[开放]" class="middle">'}</span><span style="color:#000;">${post.title}</span></b></a>${tags_html}<br><span class="middle"><img src="/static/image/icon/user.svg" width="20px" alt="作者" class="middle">${post.author}</span><span style="color:#777;"> <img src="/static/image/icon/clock-grey.svg" width="20px" alt="发布时间" class="middle">${ts2str(post.modify_time)} <img src="/static/image/icon/thumb-up-grey.svg" width="20px" alt="点赞数" class="middle">${post.loves} <img src="/static/image/icon/eye-grey.svg" width="20px" alt="访问数" class="middle">${post.views}</span></div>`;
            }
            gebi("posts-list-html").innerHTML = pl_html?pl_html:`<span style="color:#777;">没有帖子</span>`;
            gebi("page-index").innerHTML = (rep.data.page_index+1).toString();
            gebi("page-amount").innerHTML = rep.data.page_amount.toString();
            gen_cp_buttons(rep.data.page_index+1, rep.data.page_amount, 7, function(i){load_posts(i-1);}, gebi("change-page-div"), "wux-btn cp-btn", "wux-btn wux-btn-outline cp-btn");
        }else{
            gebi("posts-list-html").innerHTML = "无法加载帖子列表，因为:"+rep.message;
        }
        set_buttons_status(false);
    }, function(val){
        gebi("posts-list-html").innerHTML = "无法加载帖子列表，因为:"+val.message;
        set_buttons_status(false);
    });
}
load_posts(0);
