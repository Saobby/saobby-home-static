<script setup>
  import {IconSearch} from "@tabler/icons-vue"
  import {onMounted, ref, watch} from "vue";
  import BtnWithLoading from "@/components/BtnWithLoading.vue";
  import TagSelect from "@/components/TagSelect.vue";
  import { updateUrlArgs, getUrlArgs } from "@/assets/js/util";
  const props = defineProps({
    disabled: {type: Boolean, default: false}
  });
  const emit = defineEmits(["search"]);
  const keyword = ref("");
  const sort = ref("0");
  const order = ref("0");
  const includedTags = ref([]);
  const excludedTags = ref([]);

  const args = getUrlArgs();

  function search() {
    const searchParams = {
      sort: sort.value,
      order: order.value,
      keyword: keyword.value,
      includedTags: JSON.stringify(includedTags.value),
      excludedTags: JSON.stringify(excludedTags.value),
    };
    updateUrlArgs(searchParams);
    emit("search", {
      keyword: keyword.value,
      sort: sort.value,
      order: order.value,
      includedTags: includedTags.value,
      excludedTags: excludedTags.value
    });
  }
  watch([sort, order, includedTags, excludedTags], ()=>{
    search();
  });
  onMounted(()=>{
    try{
      if (args.sort) sort.value = args.sort;
      if (args.order) order.value = args.order;
      if (args.keyword) keyword.value = args.keyword;
      if (args.includedTags) includedTags.value = JSON.parse(args.includedTags);
      if (args.excludedTags) excludedTags.value = JSON.parse(args.excludedTags);
    }catch (e) {
      console.error("[Search] 搜索 queryString 解析失败", e);
    }
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