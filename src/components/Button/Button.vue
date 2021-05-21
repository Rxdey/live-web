<template>
  <button class="rx-btn" :class="[
  'rx-btn'+'--'+type, size!=='normal'&&'rx-btn--'+size,
  disabled&&'is-disabled',
  loading&&'is-loading',
  single&&'is-single'
  ]" :disabled="disabled||loading">
    <i v-if="loading" class="rx-icon-loading"></i>
    <i v-else-if="icon" :class="icon"></i>
    <span v-if="$slots.default">
      <slot></slot>
    </span>
  </button>
</template>

<script>
import { reactive, ref, toRefs, onMounted, computed } from '@vue/runtime-dom';

export default {
  name: 'RxButton',
  props: {
    type: {
      type: String,
      default: 'default'
    },
    size: {
      type: String,
      default: 'normal'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    single: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="less">
@import url("../../assets/less/color.less");

.mix-btn(@backColor,@fontcolor) {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  margin: 0;
  padding: 0 32px;
  height: 40px;
  line-height: 40px;
  border-radius: 4px;
  font-size: 16px;
  background: @backColor;
  border: none;
  color: @fontcolor;
  // cursor: pointer;
  text-align: center;
  outline: none;
  overflow: hidden;
  span,
  i {
    font-size: 1em;
  }
  &::after {
    position: absolute;
    background-color: #000;
    content: "";
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    opacity: 0;
  }
  &:active {
    &::after {
      opacity: 0.4;
    }
  }
  &.is-disabled {
    opacity: 0.6;
  }
  &.is-single {
    border: 1px solid @backColor;
    color: @backColor;
    background: #fff;
  }
  &.is-loading {
    opacity: 0.6;
    .rx-icon-loading {
      animation: loading 1s linear infinite;
      display: inline-block;
    }
  }
}

.btn-group {
  .rx-btn {
    margin-bottom: 5px;
  }
}
.rx-btn {
  &--default {
    .mix-btn(#fff,#444);
    border: 1px solid #ddd;
    &.is-single {
      border: 1px solid #333;
      color: #333;
    }
  }
  &--red {
    .mix-btn(@color-red,#fff);
  }
  &--blue {
    .mix-btn(@color-blue,#fff);
  }
  &--green {
    .mix-btn(@color-green,#fff);
  }
  &--yellow {
    .mix-btn(@color-yellow,#fff);
  }
  &--large {
    display: block;
    width: 100%;
  }
  &--small {
    // padding: 0 15px;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
  }

  @keyframes loading {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
