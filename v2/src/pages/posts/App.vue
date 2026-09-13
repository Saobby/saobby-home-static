<script setup lang="js">
import { ref, onMounted } from 'vue';
import { fetch_api, ts2str } from '@/assets/js/util.js';
import PaginationButtons from '@/components/PaginationButtons.vue';
import TagsDisplay from '@/components/TagsDisplay.vue';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import {
    IconSearch,
    IconPlus,
    IconPin,
    IconLock,
    IconCircleDot,
    IconUser,
    IconClock,
    IconThumbUp,
    IconEye
} from '@tabler/icons-vue';

const domain = import.meta.env.VITE_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const postPageUrl = import.meta.env.VITE_POST_PAGE_URL;
const createPostPageUrl = import.meta.env.VITE_CREATE_POST_PAGE_URL;
const pageSize = 8;

const searchField = ref('title');
const searchText = ref('');
const sortBy = ref('modify_time');
const sortMethod = ref('0');

const pageIndex = ref(0);
const pageAmount = ref(1);
const posts = ref([]);
const status = ref('loading');
const result = ref('');
const uiDisabled = ref(false);

async function loadPosts(page_index){
    uiDisabled.value = true;
    if (status.value !== 'showing'){
        status.value = 'loading';
    }
    const sendData = {
        page_index: page_index,
        page_size: pageSize,
        sort_by: sortBy.value,
        sort_method: sortMethod.value
    };
    if (searchText.value){
        sendData.search_field = searchField.value;
        sendData.search_text = searchText.value;
    }
    const rsp = await fetch_api(domain + "/api/get_posts_list", sendData);
    if (rsp.retcode){
        status.value = 'onerror';
        result.value = rsp.msg;
    } else {
        status.value = 'showing';
        result.value = '';
        posts.value = rsp.data.posts;
        pageIndex.value = rsp.data.page_index;
        pageAmount.value = rsp.data.page_amount;
    }
    uiDisabled.value = false;
}

onMounted(() => {
    loadPosts(0);
});
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">论坛</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">帖子列表</h2>
            <div class="toolbar-row">
                <select class="wux-form-select" style="width:80px;" v-model="searchField" :disabled="uiDisabled">
                    <option value="title">标题</option>
                    <option value="content">内容</option>
                    <option value="author">作者</option>
                    <option value="tag">标签</option>
                </select>
                <input type="text" class="wux-form-input wux-form-input-md search-input" v-model="searchText" placeholder="搜索" :disabled="uiDisabled" @keyup.enter="loadPosts(0)">
                <BtnWithLoading btn-class="wux-btn-primary" :is-loading="uiDisabled" @click="loadPosts(0)"><IconSearch width="16" height="16" class="middle"/><span class="middle">搜索</span></BtnWithLoading>
            </div>
            <div class="toolbar-row">
                <span>排序:</span>
                <select class="wux-form-select" style="width:120px;" v-model="sortBy" :disabled="uiDisabled" @change="loadPosts(0)">
                    <option value="modify_time" selected>更新时间</option>
                    <option value="create_time">创建时间</option>
                    <option value="loves">点赞数</option>
                    <option value="views">查看数</option>
                </select>
                <select class="wux-form-select" style="width:80px;" v-model="sortMethod" :disabled="uiDisabled" @change="loadPosts(0)">
                    <option value="0" selected>降序</option>
                    <option value="1">升序</option>
                </select>
                <a :href="createPostPageUrl"><button type="button" class="wux-btn wux-btn-primary"><IconPlus width="16" height="16" class="middle"/><span class="middle">创建帖子</span></button></a>
            </div>
            <hr>
            <div :hidden="status!=='showing'">
                <div :hidden="posts.length !== 0" class="centered"><span class="gray">没有帖子</span></div>
                <div class="bottom-line" v-for="post in posts" :key="post.name">
                    <a :href="postPageUrl+'?pid='+post.name" target="_blank">
                        <b style="font-size:20px">
                            <span :hidden="!post.is_pinned" style="color:#5064E1;"><IconPin :width="24" :height="24" class="middle"/></span>
                            <span :style="'color:#'+(post.is_closed?'AA0000':'00AA00')"><IconLock v-show="post.is_closed" :width="24" :height="24" class="middle"/><IconCircleDot v-show="!post.is_closed" :width="24" :height="24" class="middle"/></span>
                            <span class="post-list-title">{{ post.title }}</span>
                        </b>
                    </a>
                    <TagsDisplay :tags="post.tags" tag-class="simple"/>
                    <br>
                    <span class="middle"><IconUser :width="20" :height="20" class="middle"/>{{ post.author }}</span>
                    <span class="gray"> <IconClock :width="20" :height="20" class="middle"/>{{ ts2str(post.modify_time) }} <IconThumbUp :width="20" :height="20" class="middle"/>{{ post.loves }} <IconEye :width="20" :height="20" class="middle"/>{{ post.views }}</span>
                </div>
            </div>
            <div :hidden="status!=='loading'" class="centered">
                <span class="wux-loading"></span><br>
                <span>加载中</span>
            </div>
            <div :hidden="status!=='onerror'" class="centered">
                <span class="result" v-html="'无法加载帖子列表,因为:'+result"></span>
            </div>
            <div :hidden="status!=='showing'">
                <PaginationButtons @changePage="loadPosts" :pageIndex="pageIndex" :pageAmount="pageAmount" :btnAmount="7" :disabled="uiDisabled"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
.toolbar-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.toolbar-row .search-input {
    flex: 1 1 160px;
    width: auto;
    margin-bottom: 0;
}
.bottom-line :deep(.tags-container) {
    display: inline-flex;
    vertical-align: middle;
    margin-left: 10px;
}
.wux-typo a:not(.wux-btn) .post-list-title,
.wux-typo a:not(.wux-btn):hover .post-list-title {
    color: #000;
}
@media (prefers-color-scheme: dark) {
    .wux-typo a:not(.wux-btn) .post-list-title,
    .wux-typo a:not(.wux-btn):hover .post-list-title {
        color: white;
    }
}
body[dark-mode] .wux-typo a:not(.wux-btn) .post-list-title,
body[dark-mode] .wux-typo a:not(.wux-btn):hover .post-list-title {
    color: white;
}
</style>