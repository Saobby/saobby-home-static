<script setup>
  import {computed} from "vue";

  const props = defineProps({
    pageIndex: Number,
    pageAmount: Number,
    btnAmount: Number,  // 必须为奇数
    disabled: {type: Boolean, default: false},
  });
  const emit = defineEmits(["changePage"]);
  const indexes = computed(() => {
    let from = props.pageIndex - Math.floor(props.btnAmount / 2);
    let to = props.pageIndex + Math.floor(props.btnAmount / 2);
    if (from < 0){
      to += -from;
      from = 0;
    }else if (to >= props.pageAmount){
      from -= (to - props.pageAmount + 1);
      to = props.pageAmount - 1;
    }
    if (from < 0){
      from = 0;
    }
    if (to >= props.pageAmount){
      to = props.pageAmount - 1;
    }
    let result = [];
    for (let i = from; i <= to; i++) {
      if (i === from && i !== 0){
        result.push({index: 0, display: "«"});
      }else if (i === to && i !== props.pageAmount - 1){
        result.push({index: props.pageAmount - 1, display: "»"});
      }else{
        result.push({index: i, display: (i + 1).toString()});
      }
    }
    return result;
  });
</script>

<template>
  <div class="wux-btn-group">
    <button v-for="item in indexes" :class="item.index==pageIndex?'wux-btn':'wux-btn wux-btn-outline'" @click="emit('changePage', item.index)" :disabled="disabled">
      {{ item.display }}
    </button>
  </div>
  <span class="simple" style="margin-left: 20px;">第{{ pageIndex+1 }}/{{ pageAmount }}页</span>
</template>

<style scoped>

</style>