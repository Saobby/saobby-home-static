<script setup>
import { ref, watch } from 'vue';
import BtnWithLoading from './BtnWithLoading.vue';
import { IconPencil, IconCheck, IconX } from '@tabler/icons-vue';
const props = defineProps({
    canEdit: { type: Boolean, default: false },
    edit: { type: Function, default: async (e) => {} },
    btnClass: { type: String, default: "" },
    inputClass: { type: String, default: "" },
    titleClass: { type: String, default: "" },
    modelValue: { type: String, default: '' }
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
  <h3 :hidden="showEdit" :class="titleClass">{{ content }}
    <button @click="showEdit = true" v-if="canEdit" :hidden="showEdit" :class="'wux-btn wux-btn-text icon-btn mc simple '+btnClass" type="button">
        <IconPencil width="24px" height="24px" />
    </button>
  </h3>
  <div :hidden="!showEdit">
    <input style="width: calc(100% - 90px);display:inline-block;" :hidden="!showEdit" :class="'wux-form-input'+inputClass" v-model="editContent"></input>
    <button :hidden="!showEdit" @click="showEdit = false;" type="button" :class="'wux-btn wux-btn-outline icon-btn2 simple'+btnClass"><IconX width="24px" height="24px" /></button>
    <BtnWithLoading @click="edit_()" :isLoading="isLoading" :hidden="!showEdit" :btnClass="'wux-btn icon-btn2 simple'+btnClass"><IconCheck width="24px" height="24px" /></BtnWithLoading>
    <span class="result" :hidden="!showEdit" v-html="result"></span>
    <br :hidden="!showEdit">
  </div>
</template>