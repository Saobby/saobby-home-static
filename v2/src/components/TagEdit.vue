<script setup>
import { ref, watch } from 'vue';
import TagSelect from './TagSelect.vue';
import TagsDisplay from './TagsDisplay.vue';
import BtnWithLoading from './BtnWithLoading.vue';
import { IconPencil, IconCheck, IconX } from '@tabler/icons-vue';
const props = defineProps({
    canEdit: { type: Boolean, default: false },
    edit: { type: Function, default: async (e) => {} },
    btnClass: { type: String, default: "" },
    tagClass: { type: String, default: "" },
    clickTag: { type: Function, default: () => {} },
    choices: { type: Array, default: () => ["古典", "流行", "摇滚", "金属", "电子", "嘻哈", "爵士", "民谣"] },
    modelValue: { type: Array, default: () => [] },
    defaultDisplay: { type: String, default: "" }
});
const emits = defineEmits(['update:modelValue', 'edited']);
const tags = ref(props.modelValue);
watch(() => props.modelValue, (newVal) => {
    tags.value = newVal;
    editTags.value = newVal;
});
watch(tags, (newVal) => {
    emits('update:modelValue', newVal);
});
const editTags = ref(props.modelValue);
const showEdit = ref(false);
const isLoading = ref(false);
const result = ref("");
async function edit_(){
    isLoading.value = true;
    result.value = "";
    const rsp = await props.edit(editTags.value);
    if (rsp.retcode){
        result.value = rsp.msg;
    } else {
        result.value = "";
        tags.value = editTags.value;
        showEdit.value = false;
        emits("edited", editTags.value);
    }
    isLoading.value = false;
}
</script>
<template>
    <span class="bt" :hidden="showEdit">
        <TagsDisplay :tags="tags" :show-delete="false" :tag-class="tagClass" :display-default="defaultDisplay" @click="clickTag"></TagsDisplay>
    </span>
    <button @click="showEdit = true" v-if="canEdit" :hidden="showEdit" :class="'wux-btn wux-btn-text icon-btn '+btnClass" type="button">
        <IconPencil width="24px" height="24px" />
    </button>
    <span :hidden="!showEdit">
        <TagSelect v-model="editTags" :choices="choices" />
        <button @click="showEdit = false" :class="'wux-btn wux-btn-round wux-btn-outline simple mc icon-btn2 ' + btnClass" type="button">
            <IconX width="16px" height="16px" />
        </button>
        <BtnWithLoading :btn-class="'wux-btn-round simple mc icon-btn2 ' + btnClass" :loading="isLoading" @click="edit_">
            <IconCheck width="15px" height="16px" />
        </BtnWithLoading>
        <span class="result simple" v-html="result"></span>
    </span>
</template>