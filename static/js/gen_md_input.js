function gen_md_input(){
    const divs = gebcn("gen-md-input");
    for (let i=0; i<divs.length; i++){
        const div = divs[i];
        const textarea_id = div.getAttribute("input-id");
        let textarea = document.createElement("textarea");
        textarea.rows = parseInt(div.getAttribute("input-rows"));
        textarea.placeholder = div.getAttribute("input-placeholder");
        textarea.id = textarea_id;
        textarea.className = "wux-form-input wux-form-input-md marked-textarea";
        let preview_div = document.createElement("div");
        preview_div.className = "pre-like";
        preview_div.hidden = true;
        let preview_btn = document.createElement("button");
        preview_btn.className = "wux-btn wux-btn-primary wux-btn-outline";
        preview_btn.type = "button";
        preview_btn.innerHTML = icon_with_text("eye-primary", "预览");
        preview_btn.style.marginRight = "3px";
        let edit_btn = document.createElement("button");
        edit_btn.className = "wux-btn wux-btn-primary wux-btn-outline";
        edit_btn.type = "button";
        edit_btn.innerHTML = icon_with_text("edit-primary", "编辑");
        edit_btn.style.marginRight = "3px";
        edit_btn.hidden = true;
        preview_btn.addEventListener("click", function (){
            preview_div.innerHTML = marked.parse(textarea.value);
            preview_btn.hidden = true;
            edit_btn.hidden = false;
            textarea.hidden = true;
            preview_div.hidden = false;
        });
        edit_btn.addEventListener("click", function (){
            preview_btn.hidden = false;
            edit_btn.hidden = true;
            textarea.hidden = false;
            preview_div.hidden = true;
        });
        let upload_span = document.createElement("span");
        let emotions_span = document.createElement("span");
        upload_span.innerHTML = pasteToUpload.gen_upload_btn(textarea_id, "md");
        emotions_span.innerHTML = emotionBar.gen_open_btn(textarea_id, "md");
        div.appendChild(textarea);
        div.appendChild(preview_div);
        div.appendChild(preview_btn);
        div.appendChild(edit_btn);
        div.appendChild(upload_span);
        div.appendChild(emotions_span);
    }
    add_markdown_tips();
}