<script setup lang="js">
import PaginationButtons from './PaginationButtons.vue';
import { fetch_api } from '@/assets/js/util.js';
import { computed, watch, ref } from 'vue';
import CommentsList from './CommentsList.vue';
import AddCommentInput from './AddCommentInput.vue';
const props = defineProps({
    placeId: {type: Number}
});
const pageIndex = ref(0);
const pageAmount = ref(1);
const comments = ref([]);
const result = ref("");
const status = ref("loading");
async function updateComments(){
    const payload = {
        amount_per_page: 8, 
        page_index: pageIndex.value,
        place_id: props.placeId
    }
    if (localStorage.getItem("access-token")){
        payload.access_token = localStorage.getItem("access-token");
    }
    uiDisabled.value = true;
    const rsp = await fetch_api(import.meta.env.VITE_API_DOMAIN+"/api/get_comment", payload);
    if (rsp.retcode){
        status.value = "onerror";
        result.value = rsp.msg;
    } else {
        status.value = "showing";
        result.value = "";
        comments.value = rsp.data;
        pageAmount.value = rsp.comment_data.page_amount;
    }
    uiDisabled.value = false;
}
const parsedComments = computed(()=>{
    function p(commentsList, lvl){
        let result = [];
        for (let i=0; i<commentsList.length; i++){
            const comment = commentsList[i];
            comment.lvl = lvl;
            const { replies, ...rest } = comment;
            result.push(rest);
            result = result.concat(p(comment.replies, lvl+1));
        }
        return result;
    }
    return p(comments.value, 0);
});
const uiDisabled = ref(false);
watch(() => props.placeId, () => {
    if (props.placeId) {
        pageIndex.value = 0;
        updateComments();
        loadDraftN.value += 1;  // 加载草稿
    }
});
const loadDraftN = ref(0);

</script>
<template>
    <AddCommentInput :load-draft-n="loadDraftN" :placeId="props.placeId" placeholder="请输入评论内容, 最多 4096 字" @commentAdded="pageIndex=0;updateComments()"/>
    <div :hidden="status!=='showing'">
        <CommentsList @updateComments="updateComments()" :placeId="placeId" :comments="parsedComments"/>
    </div>
    <div :hidden="status!=='loading'" class="centered">
        <span class="wux-loading" /><br>
        <span>评论加载中</span><br>
    </div>
    <div :hidden="status!=='onerror'" class="centered">
        <span class="result" v-html="'无法加载评论:'+result"></span>
    </div>
    <PaginationButtons @changePage="(i)=>{pageIndex=i;updateComments()}" :pageIndex="pageIndex" :pageAmount="pageAmount" :btnAmount="7" :disabled="uiDisabled"/>
</template>