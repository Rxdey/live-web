<template>
  <div class="Home">
    <!-- <rx-button type="green">点我</rx-button> -->
    <div class="navigation">
      <el-button type="success" @click="jump">开始吧！</el-button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { reactive, ref, toRefs, onMounted, computed } from 'vue';

export default {
  name: 'Home',
  components: {
  },
  setup() {
    const route = useRouter();
    const jump = () => {
      route.push('/UserRoom');
    };
    return {
      jump
    };
  }
};
</script>

<style lang="less">
.navigation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
