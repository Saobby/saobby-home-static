<script setup lang="js">
import { ref } from 'vue';
import { IconMoodHappy } from '@tabler/icons-vue';
const props = defineProps({
    emotions: { type: Array }, 
    show: { type: Boolean, default: false }
});
// emotions: 
// [ { index: xxx, name: xxx, emojis: [ { name: xxx, url: xxx, type: xxx } ] } ]
const emits = defineEmits(['selectEmoji']);

const id = Math.random().toString(36).substring(2, 15);
const selectedPack = ref(0);
const name = 'emotion-pack-select-'+id;
</script>
<template>
    <button class="wux-btn wux-btn-warning wux-btn-text wux-btn-md icon-btn simple"><IconMoodHappy width="24px" height="24px"/></button>
    <div style="position:fixed;top:calc(50vh - 175px);left:calc(50vw - 175px);width:350px;height:350px;background:#ffffff;" class="pre-like" v-if="show">
        <div style="width:100%;height:65px;overflow-y:hidden;overflow-x:auto;" class="wux-tab">
            <div style="white-space:nowrap;">
                <span v-for="pack in emotions">
                    <input class="wux-tab-item" type="radio" :name="name" :checked="selectedPack===pack.index" :id="name+'-'+pack.index" @click="selectedPack=pack.index"/>
                    <label class="wux-tab-item" :for="name+'-'+pack.index" style="display:inline-block;">
                        {{ pack.name }}
                    </label>
                </span>
            </div>
        </div>
        <div style="height:calc(100% - 130px);overflow-y:auto;line-height:40px;margin-top:10px;margin-bottom:10px;">
            <span v-for="emoji in emotions[selectedPack].emojis">
                <a href="javascript:;" style="padding:8px;" v-if="emoji.type === 1" @click="emits('selectEmoji', emoji.name);">
                    <img height="64px" :alt="emoji.name" :src="emoji.url" :title="emoji.name">
                </a>
                <a href="javascript:;" style="padding:8px;" v-if="emoji.type === 0" @click="emits('selectEmoji', emoji.name);">
                    <img height="24px" width="24px" :alt="emoji.name" :src="emoji.url" :title="emoji.name">
                </a>
            </span>
            
        </div>
    </div>
    
</template>
<style scoped>

</style>