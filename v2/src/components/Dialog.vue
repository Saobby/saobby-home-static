<script setup lang="js">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { IconX, IconCheck } from '@tabler/icons-vue';
import PopupBackdrop from './PopupBackdrop.vue';

const props = defineProps({
    show: { type: Boolean, default: true },
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    input: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
    inputRows: { type: Number, default: 3 },
    mustFill: { type: Boolean, default: false },
    defaultValue: { type: String, default: "" },
    confirmText: { type: String, default: "确定" },
    cancelText: { type: String, default: "取消" },
    showCancel: { type: Boolean, default: true },
    zIndex: { type: Number, default: 114515 }
});
const emits = defineEmits(['confirm', 'cancel']);

const inputValue = ref(props.defaultValue);
const result = ref("");
const textareaRef = ref(null);

async function resetAndFocus(){
    inputValue.value = props.defaultValue;
    result.value = "";
    await nextTick();
    if (props.input && textareaRef.value){
        textareaRef.value.focus();
    }
}
function onKeydown(event){
    // Esc 等同点取消；输入法组字过程中(中文)不要处理
    if (event.keyCode === 27 && !event.isComposing){
        event.preventDefault();
        onCancel();
    }
}
watch(() => props.show, (show) => {
    if (show){
        resetAndFocus().then();
        document.addEventListener("keydown", onKeydown);
    }else{
        document.removeEventListener("keydown", onKeydown);
    }
}, { immediate: true });
onBeforeUnmount(() => {
    document.removeEventListener("keydown", onKeydown);
});

function onConfirm(){
    if (props.input && props.mustFill && !inputValue.value){
        result.value = "不能为空";
        return;
    }
    // 输入模式回传内容，普通确认框回传 true
    emits('confirm', props.input ? inputValue.value : true);
}
function onCancel(){
    emits('cancel');
}
</script>

<template>
    <div :hidden="!show">
        <!-- 点背景不关闭（Esc 等同取消，见 onKeydown）；背景上阻止滚动穿透 -->
        <PopupBackdrop :style="'z-index:'+(zIndex-1)" @wheel.prevent @touchmove.prevent/>
        <!-- wux.css 有 `.wux-dialog:not([open]){display:none}`（open 是原生 <dialog> 的属性），
             所以这里必须挂 open，显隐由外层 :hidden 控制 -->
        <div class="wux-dialog dialog-box" open role="dialog" aria-modal="true" :style="'z-index:'+zIndex">
            <div class="wux-dialog-header">
                <h1 class="wux-dialog-header-title">{{ title }}</h1>
            </div>
            <div class="wux-dialog-body">
                <span :hidden="!content">{{ content }}</span>
                <textarea ref="textareaRef" :hidden="!input" v-model="inputValue" :rows="inputRows" :placeholder="placeholder"
                          class="wux-form-input wux-form-input-md dialog-input" @keydown.enter.exact.prevent="onConfirm()"></textarea>
            </div>
            <div class="wux-dialog-footer">
                <span class="result">{{ result }}</span>
                <div class="wux-dialog-footer-group">
                    <button :hidden="!showCancel" type="button" class="wux-btn wux-btn-primary wux-btn-outline" @click="onCancel()"><IconX :width="16" :height="16" class="middle"/><span class="middle">{{ cancelText }}</span></button>
                    <button type="button" class="wux-btn wux-btn-primary" @click="onConfirm()"><IconCheck :width="16" :height="16" class="middle"/><span class="middle">{{ confirmText }}</span></button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 原版 <dialog> 靠 UA 样式居中，换成 div 后要自己补；不用 inset/fit-content
   （legacy 目标含 Safari 11/Chrome 49 不支持）；不要设 box-sizing：原版是 content-box，
   改成 border-box 会整整小掉左右各 24px padding */
.dialog-box {
    top: 50%;
    left: 50%;
    margin: 0;
    transform: translate(-50%, -50%);
    max-height: calc(80vh - 48px);   /* 48px = padding 24px * 2 */
}
.dialog-input {
    margin-top: 8px;
    margin-bottom: 0;
    height: auto;
}
.dialog-box .wux-dialog-footer .result {
    line-height: 34px;
}
/* 两个按钮间的间隔（--button-margin-right 是 0，模板里元素之间的空白会被编译器去掉）；
   用 margin 而不是 flex gap，老浏览器也支持 */
.dialog-box .wux-dialog-footer-group .wux-btn + .wux-btn {
    margin-left: 8px;
}
</style>