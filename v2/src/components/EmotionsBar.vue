<script setup lang="js">
import { ref } from 'vue';
import { IconMoodHappy, IconX } from '@tabler/icons-vue';
const props = defineProps({
    emotions: { type: Array },
    inputRef: { type: Object } // 新增，接收输入框ref
});
// emotions: 
// [ { index: xxx, name: xxx, emojis: [ { name: xxx, url: xxx, type: xxx } ] } ]

const show = ref(false);

const id = Math.random().toString(36).substring(2, 15);
const selectedPack = ref(0);
const name = 'emotion-pack-select-'+id;

function insertEmoji(emojiName) {
    const textarea = props.inputRef;
    if (!textarea){
        return;
    }
    const oldValue = textarea.value;
    const insertText = `:${emojiName}:`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = oldValue.slice(0, start) + insertText + oldValue.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + insertText.length; // 设置光标位置到插入的表情后面
    textarea.dispatchEvent(new Event("input")); // 触发input事件以更新绑定的值
    textarea.focus(); // 保持焦点在输入框
}

</script>
<template>
    <button @click="show=!show" class="wux-btn wux-btn-warning wux-btn-text wux-btn-md icon-btn simple"><IconMoodHappy width="24px" height="24px"/></button>
    <div style="position:fixed;top:calc(50vh - 175px);left:calc(50vw - 175px);width:350px;height:350px;background:#ffffff;z-index: 9999;" class="pre-like" v-if="show">
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
                <a href="javascript:;" style="padding:8px;" v-if="emoji.type === 1" @click="insertEmoji(emoji.name);show=!show;">
                    <img height="64px" :alt="emoji.name" :src="emoji.url" :title="emoji.name">
                </a>
                <a href="javascript:;" style="padding:8px;" v-if="emoji.type === 0" @click="insertEmoji(emoji.name);show=!show;">
                    <img height="24px" width="24px" :alt="emoji.name" :src="emoji.url" :title="emoji.name">
                </a>
            </span>
        </div>
        <button @click="show=!show;" class="wux-btn wux-btn-primary wux-btn-outline mc right" type="button"><IconX width="16px" height="16px" />关闭</button>
    </div>
    
</template>
<style scoped>

</style>