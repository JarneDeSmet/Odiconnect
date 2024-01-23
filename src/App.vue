<script setup lang="ts">
import {onMounted} from "vue";
import {useTensorflowStore} from "@/stores/TensorflowStore";

// useBunStore()
const tensorStore = useTensorflowStore()
onMounted(() => {
  tensorStore.loadModel()
})
</script>

<template>
  <router-view/>
</template>

<style scoped lang="scss"></style>
