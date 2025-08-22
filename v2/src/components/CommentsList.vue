<script setup lang="js">
import { IconMailCheck, IconPencilCheck, IconClock, IconMessageReply, IconEdit, IconX, IconCornerDownRight } from '@tabler/icons-vue';
import { ts2str, check_logged_in } from '@/assets/js/util.js';
import MarkdownDisplay from './MarkdownDisplay.vue';
import { onMounted, reactive, watch } from 'vue';
import EditCommentInput from './EditCommentInput.vue';
import AddCommentInput from './AddCommentInput.vue';
const props = defineProps({
    comments: {
        type: Array
    },
    placeId: {
        type: Number
    }
});
/*
comments: [
    {lvl: int, 
    avatar_url: str,
    can_edit: bool,
    cid: int,
    content: str,
    is_email_checked: bool,
    is_read: bool,
    modify_time: int,
    nickname: str,
    read_time: int,
    reply_to: int,
    timestamp: int,
    username: str
    }
]
 */
const emits = defineEmits(["updateComments"]);

const uiStatus = reactive({});
function initUiStatus(comments) {
    uiStatus.value = {};
    for (const comment of comments) {
        uiStatus[comment.cid] = {
            showReplyWindow: false,
            showEditWindow: false,
            loadDraftN: 0
        };
    }
}
watch(()=>props.comments, (lst)=>{
    initUiStatus(lst);
});
onMounted(()=>{
    initUiStatus(props.comments);
});

function updateComments() {
    emits("updateComments");
}


</script>
<template>
    <div class="centered" v-if="comments.length === 0">
        <span class="gray">没有任何评论</span>
    </div>
    <div v-for="comment in comments" :style="`position:relative;left:${20 * comment.lvl}px;`">
        <div :id="`comment-div-${comment.cid}`" style="border-bottom: 2px solid #ddd;padding:12px 0;">
            <img :src="comment.avatar_url" alt="用户头像" width="32px" height="32px">
            <b style="position:relative;top:-17px;left:5px;">{{ comment.nickname || comment.username }}</b>
            <span style="color:#777777;position:relative;top:-17px;left:5px;" class="middle mc">
                <span v-if="comment.is_email_checked" title="(已绑定电子邮箱)" class="mc lleft"><IconMailCheck width="16px" height="16px" /></span>
                <span v-if="comment.modify_time" class="lleft mc" title="(已编辑)"><IconPencilCheck width="16px" height="16px"/></span>
                <span :title="comment.modify_time?'编辑时间':'发表时间'" class="mc lleft"><IconClock width="16px" height="16px" />{{ ts2str(comment.modify_time || comment.timestamp) }}</span>
                <span class="lleft">{{ `#${comment.cid}` }}</span>
            </span>
            <br>
            <span v-if="comment.reply_to!==-1" class="gray mc"><IconCornerDownRight width="16px" height="16px"/>{{ `回复 #${comment.reply_to}` }}</span>
            <div :hidden="uiStatus[comment.cid]?.showEditWindow">
                <MarkdownDisplay :showBtn="!comment.can_edit" :md="comment.content" btnClass="wux-btn-sm">
                    <button @click="(()=>{if(!check_logged_in()){uiStatus[comment.cid].showReplyWindow=true;uiStatus[comment.cid].loadDraftN+=1;}})()" :disabled="uiStatus[comment.cid]?.showReplyWindow" class="wux-btn wux-btn-primary wux-btn-sm mc simple" type="button">
                        <IconMessageReply width="16px" height="16px" />
                        回复
                    </button>
                    <button @click="uiStatus[comment.cid].showEditWindow=true" v-if="!uiStatus[comment.cid]?.showEditWindow" :hidden="!comment.can_edit" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline mc simple" type="button">
                        <IconEdit width="16px" height="16px" />
                        编辑
                    </button>
                </MarkdownDisplay>
            </div>
            <div :hidden="!uiStatus[comment.cid]?.showEditWindow">
                <EditCommentInput :cid="comment.cid" :content="comment.content" @commentEdited="updateComments()" :rows="5" :placeholder="`编辑 #${comment.cid} 最多 4096 字`" btnClass="wux-btn-sm">
                    <button @click="uiStatus[comment.cid].showEditWindow=false" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline simple mc" type="button">
                        <IconX width="16px" height="16px" />
                        取消
                    </button>
                </EditCommentInput>
            </div>
        </div>
        <div :hidden="!uiStatus[comment.cid]?.showReplyWindow">
            <AddCommentInput :load-draft-n="uiStatus[comment.cid]?.loadDraftN" @commentAdded="updateComments()" :placeId="placeId" :replyTo="comment.cid" :placeholder="`回复 #${comment.cid}, 最多 4096 字`">
                <button @click="uiStatus[comment.cid].showReplyWindow=false" class="wux-btn wux-btn-primary wux-btn-outline simple mc" type="button">
                    <IconX width="16px" height="16px" />
                    取消
                </button>
            </AddCommentInput>
        </div>
    </div>
</template>