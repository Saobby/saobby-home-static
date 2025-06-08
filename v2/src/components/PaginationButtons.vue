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
    let ret = [];
    ret.push({index: 0, show: "1"});
    let index = props.pageIndex - (props.btnAmount - 1) / 2;
    if (index < 1) {
      index = 1;
    }else{
      ret[0].show = "«";
    }
    for (let i = 0; i < props.btnAmount-2; i++) {
      if (index >= props.pageAmount-1){
        break;
      }
        ret.push({index: index, show: (index+1).toString()});
      index++;
    }
    if (props.pageAmount >= 2){
      ret.push({index: props.pageAmount-1, show: (props.pageAmount).toString()});
      if (ret[ret.length-1].index !== ret[ret.length-2].index + 1){
        ret[ret.length-1].show = "»";
      }
    }
    return ret;
  });
</script>

<template>
  <div class="wux-btn-group">
    <button v-for="item in indexes" :class="item.index==pageIndex?'wux-btn':'wux-btn wux-btn-outline'" @click="emit('changePage', item.index)" :disabled="disabled">
      {{ item.show }}
    </button>
  </div>
  <span class="simple">第{{ pageIndex+1 }}/{{ pageAmount }}页</span>
</template>

<style scoped>

</style>