<script setup>

</script>

<template>
  <input type="text" class="wux-form-input wux-form-input-md" style="width:calc( 100% - 120px );display:inline-block;" placeholder="搜索">
  <button type="button" class="wux-btn wux-btn-primary" id="search-btn" onclick="load_posts(0);"><img src="/static/image/icon/search-white.svg" alt="" width="16px" height="16px" class="middle"><span class="middle">搜索</span></button><br>
  <span>排序:</span>
  <select class="wux-form-select" style="width:120px;" id="sort-by-select" onchange="load_posts(0);">
    <option value="modify_time" selected>更新时间</option>
    <option value="create_time">创建时间</option>
    <option value="loves">点赞数</option>
    <option value="views">查看数</option>
  </select>
  <select class="wux-form-select" style="width:80px;" id="sort-method-select" onchange="load_posts(0);">
    <option value="0" selected>降序</option>
    <option value="1">升序</option>
  </select>
  <button type="button" class="wux-btn wux-btn-primary" onclick="window.location='/create_post'"><img src="/static/image/icon/plus-white.svg" alt="" width="16px" height="16px" class="middle"><span class="middle">创建帖子</span></button>

</template>

<style scoped>

</style>