<script setup>
import { ref, onMounted } from 'vue';
import { fetch_api } from '@/assets/js/util';
import { IconCheck } from "@tabler/icons-vue";
import BtnWithLoading from "@/components/BtnWithLoading.vue";

const domain = import.meta.env.VITE_API_DOMAIN;

const loading = ref(false);
const result = ref('');
const config = ref({
    do_comment_replies_notice: false,
    do_post_replies_notice: false,
    do_read_comment_notice: false,
    do_post_loves_notice: false,
    do_post_operates_notice: false,
    do_music_replies_notice: false
});

async function saveNotificationConfig(){
    loading.value = true;
    const payload = { access_token: localStorage.getItem('access-token'), user_config: config.value };
    const rsp = await fetch_api(domain + '/api/set_user_config', payload);
    result.value = rsp.retcode ? rsp.msg : '操作成功';
    loading.value = false;
}

async function loadNotificationConfig(){
    loading.value = true;
    const rsp = await fetch_api(domain + '/api/get_user_config', { access_token: localStorage.getItem('access-token') });
    if (rsp.retcode){
        result.value = '无法加载用户配置,请刷新页面后重试。错误消息:' + rsp.msg;
    }else{
        Object.assign(config.value, rsp.data);
        loading.value = false;
    }
}

onMounted(()=>{
    loadNotificationConfig();
});
</script>

<template>
    <div>
        <h2 class="mt">通知设置</h2>
        <p>当被选中的事件发生时，系统会发送一则通知到你的通知中心。</p>
        <label><input type="checkbox" class="wux-form-checks" v-model="config.do_comment_replies_notice" :disabled="loading"> 有人回复你的评论</label><br>
        <label><input type="checkbox" class="wux-form-checks" v-model="config.do_post_replies_notice" :disabled="loading"> 有人在你的帖子下留言</label><br>
        <label><input type="checkbox" class="wux-form-checks" v-model="config.do_read_comment_notice" :disabled="loading"> 有人阅读你回复他的评论</label><br>
        <label><input type="checkbox" class="wux-form-checks" v-model="config.do_post_loves_notice" :disabled="loading"> 有人点赞你的帖子</label><br>
        <label><input type="checkbox" class="wux-form-checks" v-model="config.do_post_operates_notice" :disabled="loading"> 有人操作你的帖子(置顶/关闭/删除,仅管理员可操作)</label><br>
        <label><input type="checkbox" class="wux-form-checks" v-model="config.do_music_replies_notice" :disabled="loading"> 有人在你分享的音乐下留言</label><br><br>
        <BtnWithLoading btn-class="wux-btn-primary mc" :is-loading="loading" @click="saveNotificationConfig"><IconCheck width="16px" height="16px"/>保存</BtnWithLoading>
        <span class="result simple">{{ result }}</span>
    </div>
</template>

