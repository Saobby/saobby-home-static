<script setup>
  import {IconPlus, IconSearch} from "@tabler/icons-vue"
  import {ref, watch} from "vue";
  const props = defineProps({
    disabled: {type: Boolean, default: false}
  });
  const emit = defineEmits(["search"]);
  const keyword = ref("");
  const sort = ref("0");
  const order = ref("0");

  function search() {
    emit("search", {
      keyword: keyword.value,
      sort: sort.value,
      order: order.value
    });
  }
  watch([sort, order], ()=>{
    search();
  });
</script>

<template>
  <input type="text" class="wux-form-input wux-form-input-md" style="width:calc( 100% - 80px );display:inline-block;" placeholder="搜索" :disabled="disabled" v-model="keyword"/>
  <button type="button" class="wux-btn wux-btn-primary mc simple" :disabled="disabled" @click="search()"><IconSearch width="16px" height="16px"/>搜索</button><br>
  <span>排序:</span>
  <select class="wux-form-select simple" style="width:120px;" :disabled="disabled" v-model="sort">
    <option value="0" selected>更新时间</option>
    <option value="1">点赞数</option>
  </select>
  <select class="wux-form-select simple" style="width:80px;" :disabled="disabled" v-model="order">
    <option value="0" selected>降序</option>
    <option value="1">升序</option>
  </select>
  <a href="/share_music"><button type="button" class="wux-btn wux-btn-primary mc simple"><IconPlus width="16px" height="16px" />分享音乐</button></a>
</template>

<style scoped>

</style>