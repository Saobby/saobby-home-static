<script setup lang="js">
import PaginationButtons from './PaginationButtons.vue';
import { fetch_api, getUrlArgs, gebi } from '@/assets/js/util.js';
import { computed, watch, ref, nextTick, onMounted } from 'vue';
import CommentsList from './CommentsList.vue';
import AddCommentInput from './AddCommentInput.vue';
const props = defineProps({
    placeId: {type: Number},
    showAddCommentWindow: {type: Boolean, default: true},
    expiry: {type: Number, default: null},
    sign: {type: String, default: null},
});
const pageIndex = ref(0);
const pageAmount = ref(1);
const comments = ref([]);
const result = ref("");
const status = ref("loading");
const scrollTo = ref(null);
onMounted(()=>{
    const urlArgs = getUrlArgs();
    if (urlArgs.comment_id){
        scrollTo.value = urlArgs.comment_id;
    }
    if (urlArgs.scroll_to){
        scrollTo.value = urlArgs.scroll_to;
    }
});
async function updateComments(){
    const payload = {
        amount_per_page: 8, 
        page_index: pageIndex.value,
        place_id: props.placeId
    }
    if (localStorage.getItem("access-token")){
        payload.access_token = localStorage.getItem("access-token");
    }
    if (scrollTo.value){
        payload.scroll_to = scrollTo.value;
        scrollTo.value = null;
    }
    if (props.sign && props.expiry){
        payload.expiry = props.expiry;
        payload.sign = props.sign;
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
        pageIndex.value = rsp.comment_data.page_index-1;
        updateCommentsListN.value += 1;  // 重新挂载评论列表组件
    }
    uiDisabled.value = false;
    if (payload.scroll_to){
        await scrollToComment(payload.scroll_to);
    }
}
async function scrollToComment(commentId){
    await nextTick();
    const commentDiv = gebi(`comment-div-${commentId}`);
    if (commentDiv) {
        setTimeout(() => {
            commentDiv.scrollIntoView({
                behavior: "smooth"
            });
        }, 100);
    }
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
async function loadDraft(placeId){
    await commentInputRef.value.loadDraft(placeId);
}
const uiDisabled = ref(false);
watch(() => props.placeId, (newPlaceId) => {
    if (newPlaceId) {
        pageIndex.value = 0;
        updateComments().then();
        loadDraft(newPlaceId).then();
    }
});
const commentInputRef = ref(null);
defineExpose({updateComments, loadDraft});
const updateCommentsListN = ref(0);

</script>
<template>
    <div :hidden="!showAddCommentWindow">
        <AddCommentInput ref="commentInputRef" :placeId="props.placeId" :expiry="props.expiry" :sign="props.sign" placeholder="请输入评论内容, 最多 4096 字" @commentAdded="pageIndex=0;updateComments()"/>
    </div>
    <slot></slot>
    <div :hidden="status!=='showing'" style="width: 100%; overflow: auto;">
        <CommentsList :key="updateCommentsListN" @updateComments="updateComments()" @scrollToComment="scrollToComment" :placeId="placeId" :comments="parsedComments" :expiry="props.expiry" :sign="props.sign"/>
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