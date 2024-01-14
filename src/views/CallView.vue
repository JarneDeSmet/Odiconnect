<script setup lang="ts">
import DashboardHeader from '@/components/molecules/DashboardHeader.vue'
import CallSidebar from '@/components/organisms/CallSidebar.vue'
import { useBunStore } from '@/stores/BunStore'
import { onMounted, ref } from 'vue'
import type { Ref } from 'vue'

const bunStore = useBunStore()
const me: Ref = ref()
const peer: Ref = ref()
onMounted(async () => {
  bunStore.localStream = await navigator.mediaDevices.getUserMedia(bunStore.constraints)

  me.value.srcObject = bunStore.localStream
  peer.value.srcObject = bunStore.remoteStream
})
</script>

<template>
  <DashboardHeader />
  <main>
    <div class="call">
      <video ref="me" v-if="bunStore.localStream" autoplay playsinline id="me" muted></video>
      <video ref="peer" autoplay playsinline id="peer"></video>
      <div class="buttons">
        <span @click="bunStore.toggleMic()">mute</span>
        <span @click="bunStore.toggleCamera()">camera</span>
        <span>f</span>
        <span>f</span>
      </div>
    </div>
    <call-sidebar />
  </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
  height: calc(100vh - 3.5rem);
  flex-grow: 1;

  video {
    width: 20rem;
    height: 12rem;
    background-color: black;
    margin-right: 1rem;
  }

  .call {
    flex-grow: 1;
    position: relative;

    .buttons {
      position: absolute;
      bottom: 1.5rem;
      display: flex;
      width: calc(100% - 2rem);
      justify-content: center;
      gap: 1rem;

      span {
        text-align: center;
        width: 1rem;
        aspect-ratio: 1/1;
        background-color: red;
      }
    }
  }
}
</style>
