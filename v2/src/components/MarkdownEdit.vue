<script setup>
import { ref, watch } from 'vue';
import MarkdownDisplay from './MarkdownDisplay.vue';
import MarkdownInput from './MarkdownInput.vue';
import BtnWithLoading from './BtnWithLoading.vue';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-vue';
const props = defineProps({
    canEdit: { type: Boolean, default: false },
    edit: { type: Function, default: async (e) => {} },
    btnClass: { type: String, default: "" },
    inputClass: { type: String, default: "" },
    rows: { type: Number, default: 5 },
    placeholder: { type: String, default: "" },
    divClass: { type: String, default: "" },
    modelValue: { type: String, default: '' },
    displayDefault: { type: String, default: '' }
});
const emits = defineEmits(['update:modelValue', "edited"]);
const content = ref(props.modelValue);
watch(() => props.modelValue, (newVal) => {
    content.value = newVal;
    editContent.value = newVal;
});
watch(content, (newVal) => {
    emits('update:modelValue', newVal);
});
const editContent = ref(props.modelValue);
const showEdit = ref(false);
const isLoading = ref(false);
const result = ref("");
async function edit_(){
    isLoading.value = true;
    result.value = "";
    const rsp = await props.edit(editContent.value);
    if (rsp.retcode){
        result.value = rsp.msg;
    } else {
        result.value = "";
        content.value = editContent.value;
        showEdit.value = false;
        emits("edited", editContent.value);
    }
    isLoading.value = false;
}
</script>
<template>
  <MarkdownDisplay :show="!showEdit" :md="content || displayDefault" :show-btn="!canEdit" :btn-class="btnClass" :div-class="divClass">
    <button @click="showEdit = true" v-if="canEdit" :hidden="showEdit" :class="'wux-btn wux-btn-outline mc simple '+btnClass" type="button">
      <IconEdit width="16px" height="16px" />编辑
    </button>
  </MarkdownDisplay>
  <div :hidden="!showEdit">
    <MarkdownInput :rows="rows" :placeholder="placeholder" :btnClass="btnClass" :inputClass="inputClass" v-model="editContent">
      <button @click="showEdit = false" :class="'wux-btn wux-btn-outline simple mc ' + btnClass" type="button">
        <IconX width="16px" height="16px" />取消
      </button>
      <BtnWithLoading @click="edit_()" :isLoading="isLoading" :btnClass="'wux-btn-primary simple mc ' + btnClass">
        <IconCheck width="16px" height="16px" />保存
      </BtnWithLoading>
    </MarkdownInput>
    <span class="result simple" v-html="result"></span>
  </div>
</template>