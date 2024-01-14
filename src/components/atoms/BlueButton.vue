<script setup lang="ts">
import type { PropType, ButtonHTMLAttributes } from 'vue'

defineProps({
  type: {
    type: String as PropType<ButtonHTMLAttributes['type']>,
    required: true
  }
})
</script>

<template>
  <button :type="type">
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">
button {
  color: var(--foreground);
  background: var(--accent);
  box-shadow: 2px 2px 10px -1px rgba(255, 255, 255, 0.2);
  transition-duration: 0.2s;

  font-size: 1.3rem;
  font-weight: 500;

  border: none;
  border-radius: 3px;
  width: 16rem;
  padding: 0.5rem 0;

  &:hover {
    cursor: pointer;
    background: rgba(20, 90, 250, 1);
    transform: translateY(-0.1em);
    transition-duration: 0.2s;
  }
}
</style>
