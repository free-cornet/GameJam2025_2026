<template>
  <!-- :style="buttonStyle" -->
  <button
    :disabled="disabled"
    class="group h-32 w-80 relative transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
    :class="{ 'hovered': isHovered }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    v-bind="$attrs"
  >
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-contain bg-no-repeat bg-center group-hover:-hue-rotate-90 transition-all duration-300"
      :style="backgroundImageStyle"
    />

    <!-- Text Content -->
    <span class="relative z-10 text-white text-lg font-bold py-3 px-8 grid place-items-center" :style="textStyle">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed, ref } from "vue";
import basic from '../assets/button4.png';
import hovered from '../assets/button3.png';

const isHovered = ref(false);

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  scale: {
    type: Number,
    default: 1.7,
  },
  textScale: {
    type: Number,
    default: 0.8,
  },
});

const currentButtonImage = computed(() => {
  return isHovered.value ? hovered : basic;
});

const backgroundImageStyle = computed(() => ({
  backgroundImage: `url(${currentButtonImage.value})`,
}));
</script>

<style scoped>
button {
  display: inline-block;
  border: none;
  cursor: pointer;
  padding: 0;
}
</style>
