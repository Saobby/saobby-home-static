<script lang="js" setup>
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import {onMounted, ref, nextTick} from 'vue';
import {checkInApi, getCheckInStatusApi, getDate} from './checkInBox.js';
import { check_logged_in, gebi } from '@/assets/js/util.js';
import {IconClover} from '@tabler/icons-vue';
import { make_splash } from "@/assets/js/particle";

const uiStatus = ref(0);  // 0: 加载 1: 显示日期 2: 签到完成
const loadingResult = ref('');
const checkInResult = ref('');
const date = getDate();
const fortune = ref('');
const combo = ref(0);
const isCheckInLoading = ref(false);
async function getCheckInStatus() {
    uiStatus.value = 0;
    if (!localStorage.getItem('access-token')) {
        uiStatus.value = 1;
        return;
    }
    const rsp = await getCheckInStatusApi();
    if (rsp.retcode) {
        loadingResult.value = rsp.msg;
    } else {
        if (rsp.data.checked_in){
            fortune.value = rsp.data.fortune.fortune;
            combo.value = rsp.data.combo;
            uiStatus.value = 2;
        }else{
            uiStatus.value = 1;
        }
    }
}
onMounted(() => {
    getCheckInStatus();
});
async function checkIn(){
    if (check_logged_in()){
        return;
    }
    isCheckInLoading.value = true;
    const rsp = await checkInApi();
    isCheckInLoading.value = false;
    if (rsp.retcode){
        checkInResult.value = rsp.msg;
    } else {
        fortune.value = rsp.data.fortune.fortune;
        combo.value = rsp.data.combo;
        uiStatus.value = 2;
        make_splash(gebi("check-in-btn"));
    }
}
</script>
<template>
    <div class="centered">
        <div :hidden="uiStatus !== 0">
            <span class="wux-loading"></span><br>
            <span class="result" v-html="loadingResult"></span>
        </div>
        <div :hidden="uiStatus !== 1">
            <span style="font-size: 20px">今天是</span><br>
            <span style="color: #4050b4; font-size: 48px;">{{ date }}</span><br>
            <BtnWithLoading btn-id="check-in-btn" @click="checkIn()" btn-class="mc2" :is-loading="isCheckInLoading"><IconClover width="16px" height="16px"/><span>签到</span></BtnWithLoading><br/>
            <span class="result" v-html="checkInResult"></span>
        </div>
        <div :hidden="uiStatus !== 2">
            <span style="font-size: 20px">今日运势</span><br>
            <span style="color: #f59632; font-size: 48px;">{{ fortune }}</span><br>
            <span>你已连续签到<b>{{ combo }}</b>天</span>
        </div>
    </div>
</template>