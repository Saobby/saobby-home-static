<script setup>
  import {IconSearch} from "@tabler/icons-vue"
  import {ref, watch} from "vue";
  import BtnWithLoading from "@/components/BtnWithLoading.vue";
  import TagSelect from "@/components/TagSelect.vue";
  import { updateUrlArgs } from "@/assets/js/util";
  const props = defineProps({
    disabled: {type: Boolean, default: false},
    initialSort: {type: String, default: "0"},
    initialOrder: {type: String, default: "0"},
    initialKeyword: {type: String, default: ""},
    initialIncludedTags: {type: Array, default: () => []},
    initialExcludedTags: {type: Array, default: () => []},
    initialFilter: {type: String, default: "0"}
  });
  const emit = defineEmits(["search"]);
  const keyword = ref(props.initialKeyword);
  const sort = ref(props.initialSort);
  const order = ref(props.initialOrder);
  const includedTags = ref(Array.isArray(props.initialIncludedTags) ? [...props.initialIncludedTags] : []);
  const excludedTags = ref(Array.isArray(props.initialExcludedTags) ? [...props.initialExcludedTags] : []);
  const filter = ref(props.initialFilter);

  const loggedIn = localStorage.getItem("access-token");

  function search() {
    const searchParams = {
        sort: sort.value,
        order: order.value,
        keyword: keyword.value,
        includedTags: JSON.stringify(includedTags.value),
        excludedTags: JSON.stringify(excludedTags.value),
        filter: filter.value,
    };
    updateUrlArgs(searchParams);
    emit("search", {
        keyword: keyword.value,
        sort: sort.value,
        order: order.value,
        includedTags: includedTags.value,
        excludedTags: excludedTags.value,
        filter: filter.value,
    });
  }
  watch([sort, order, includedTags, excludedTags, filter], ()=>{
    search();
  });
</script>

<template>
  <input
      type="text"
      class="wux-form-input wux-form-input-md"
      style="width:calc( 100% - 80px );display:inline-block;"
      placeholder="搜索"
      :disabled="disabled"
      v-model="keyword"
      @keyup.enter="search()"
  />
  <BtnWithLoading @click="search()" :isLoading="disabled" btnClass="wux-btn-primary mc simple"><IconSearch width="16px" height="16px"/>搜索</BtnWithLoading>
  <br>
  <span>排序:</span>
  <select class="wux-form-select simple" style="width:120px;" :disabled="disabled" v-model="sort">
    <option value="0" selected>更新时间</option>
    <option value="1">点赞数</option>
  </select>
  <select class="wux-form-select simple" style="width:80px;" :disabled="disabled" v-model="order">
    <option value="0" selected>降序</option>
    <option value="1">升序</option>
  </select>
  <br>
    <span>筛选:</span>
    <select class="wux-form-select simple" style="width:200px;margin-top: 4px;" :disabled="disabled || !loggedIn" v-model="filter">
        <option value="0" selected>全部</option>
        <option value="1">我上传的</option>
        <option value="2">我点赞的</option>
        <option value="3">我上传的或我点赞的</option>
    </select>
    <br>
  <span class="select-tags">
    <span>包含标签:</span>
    <TagSelect v-model="includedTags"/>
  </span>
  <br>
  <span class="select-tags">
    <span>排除标签:</span>
    <TagSelect v-model="excludedTags"/>
  </span>
  <br>
  <slot></slot>
</template>

<style scoped>
.select-tags {
  display: inline-block;
  margin-top: 5px;
}
</style>