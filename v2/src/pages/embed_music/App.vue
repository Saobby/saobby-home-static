<script setup lang="js">
import {onMounted, ref} from "vue";
import {getUrlArgs} from "@/assets/js/util.js";
import EmbeddedMusicPlayer from "@/pages/music/components/EmbeddedMusicPlayer.vue";

const musicId = ref(0);
const expiry = ref(null);
const sign = ref(null);
const autoplay = ref(false);
const hasParam = ref(false);

onMounted(() => {
    const args = getUrlArgs();
    if (args.music_id) {
        musicId.value = parseInt(args.music_id);
        if (args.expiry) {
            expiry.value = parseInt(args.expiry);
        }
        if (args.sign) {
            sign.value = args.sign;
        }
        if (args.autoplay !== undefined) {
            autoplay.value = args.autoplay === "1" || args.autoplay === "true";
        }
        hasParam.value = true;
    }
});
</script>

<template>
    <div class="embed-page-container">
        <div v-if="!hasParam" class="error-hint">
            缺少 music_id 参数
        </div>
        <EmbeddedMusicPlayer
            v-if="hasParam"
            :music-id="musicId"
            :expiry="expiry"
            :sign="sign"
            :autoplay="autoplay"
        />
    </div>
</template>

<style scoped>
.embed-page-container {
    box-sizing: border-box;
    width: 100%;
    padding: 0;
    font-family: inherit;
}

.error-hint {
    padding: 16px;
    text-align: center;
    color: #999;
}
</style>