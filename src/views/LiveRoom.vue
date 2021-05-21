<template>
  <div class="LiveRoom">

  </div>
</template>

<script>
import { reactive, ref, toRefs, onMounted, computed } from '@vue/runtime-dom';

export default {
  name: 'LiveRoom',
  props: {
  },
  components: {
  },
  setup(props, context) {
    const data = reactive({
      remotePeer: null,
      socket: null
    });
  }
};
</script>

<style lang="less">
</style>
