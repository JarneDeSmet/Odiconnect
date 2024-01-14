<script setup lang="ts">
import type { ChatType } from '@/interfaces'
import { getAuth } from 'firebase/auth'
import type { PropType } from 'vue'

defineProps({
  message: {
    type: Object as PropType<ChatType>,
    required: true
  }
})
</script>

<template>
  <div class="group" :class="message.sender.uid === getAuth().currentUser?.uid ? 'me-group' : ''">
    <div :class="message.sender.uid === getAuth().currentUser?.uid ? 'me' : ''">
      <h2>
        <slot></slot>
      </h2>
      <p>{{ message.text }}</p>
    </div>

    <p class="timestamp" :class="message.sender.uid === getAuth().currentUser?.uid ? 'meTime' : ''">
      {{ message.timestamp.toDate().toLocaleString() }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.me-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  div {
    width: 100%;
  }
}

.group {
  .timestamp {
    color: #989898;
    font-weight: 400;
    font-size: 1rem;
  }

  .meTime {
    text-align: end;
  }

  div {
    max-width: 15rem;
    padding: 0.2rem 1rem 0.5rem;
    border-radius: 20px 20px 20px 0;
    background: linear-gradient(93deg, #414141 0%, #383636 100%);

    h2 {
      font-size: 1.1rem;
      font-weight: 300;
    }
  }

  .me {
    border-radius: 20px 20px 0px 20px;
    background: linear-gradient(93deg, #084eb8 0%, #052a61 100%);

    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>
