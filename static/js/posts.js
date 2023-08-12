var domain = "https://api-ry.saobby.com/comment";
var page_size = 8;
function load_posts(page_index){
    gebi("sort-by-select").disabled = true;
    gebi("sort-method-select").disabled = true;
    var cp_btn = gebcn("cp-btn");
    for (var a=0; a<cp_btn.length; a++){
        cp_btn[a].disabled = true;
    }
    var sb_select = gebi("sort-by-select");
    var sm_select = gebi("sort-method-select");
    var sort_by = sb_select.options[sb_select.selectedIndex].value;
    var sort_method = sm_select.options[sm_select.selectedIndex].value;
    fetch_data(domain+"/api/get_posts_list", "POST", headers, JSON.stringify({"page_index": page_index, "page_size": page_size, "sort_by": sort_by, "sort_method": sort_method})).then(function(val){
        var rep = JSON.parse(val.response_text);
        if (rep.success){
            var pl_html = "";
            for (var i in rep.data.posts){
                var post = rep.data.posts[i];
                pl_html += `<div style="border-bottom: 2px solid #ddd;padding:12px 16px;"><a href="/post/?pid=${post.name}" target="_blank"><b style="font-size:20px"><span style="color:#5064E1;">${post.is_pinned?"[置顶]":""}</span><span style="color:#${post.is_closed?"AA0000":"00AA00"};">${post.is_closed?"[已关闭]":"[开放]"}</span><span style="color:#000;">${post.title}</span></b></a><br><span>作者:${post.author}</span><span style="color:#777;"> 发表于 ${ts2str(post.modify_time)} ${post.loves}个赞 ${post.views}次访问</span></div>`;
            }
            gebi("posts-list-html").innerHTML = pl_html;
            gebi("page-index").innerHTML = (rep.data.page_index+1).toString();
            gebi("page-amount").innerHTML = rep.data.page_amount.toString();
            gen_cp_buttons(rep.data.page_index+1, rep.data.page_amount, 7, function(i){load_posts(i-1);}, gebi("change-page-div"), "wux-btn cp-btn", "wux-btn wux-btn-outline cp-btn");
        }else{
            gebi("posts-list-html").innerHTML = "无法加载帖子列表，因为:"+rep.message;
        }
        gebi("sort-by-select").disabled = false;
        gebi("sort-method-select").disabled = false;
        for (var a=0; a<cp_btn.length; a++){
            cp_btn[a].disabled = false;
        }
    }, function(val){
        gebi("posts-list-html").innerHTML = "无法加载帖子列表，因为:"+val.message;
        gebi("sort-by-select").disabled = false;
        gebi("sort-method-select").disabled = false;
        for (var a=0; a<cp_btn.length; a++){
            cp_btn[a].disabled = false;
        }
    });
}
load_posts(0);
