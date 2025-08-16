<script lang="js" setup>
import { fetch_api } from '@/assets/js/util.js';
import { onMounted, ref } from 'vue';
import { IconCake } from '@tabler/icons-vue';
const domain = import.meta.env.VITE_BIRTHDAYSTAR_API_DOMAIN;

const show = ref(false);
const content = ref("");
onMounted(async () => {
    const rsp = await fetch_api(domain+"/api/get_birthdaystar");
    if (rsp.retcode){
        content.value = "无法获取今日寿星:" + rsp.msg;
        // show.value = true;  如果出错就直接不显示
    } else {
        if (rsp.data.length > 0){
            content.value = `今天是<b>${rsp.data.join("、")}</b>的生日！`;
            show.value = true;
        }
    }
});
</script>
<template>
    <div class="wux-row-md-1" :hidden="!show">
        <div class="wux-col birthdaystar">
            <div class="wux-card wux-card-flat mb">
                <div class="wux-card-body mc2">
                    <icon-cake width="16px" height="16px"/>
                    <span class="simple" v-html="content"></span>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.birthdaystar {
    padding-left: 4px;
    padding-right: 4px;
}
</style>