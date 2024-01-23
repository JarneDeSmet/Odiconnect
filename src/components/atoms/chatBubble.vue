<script setup lang="ts">
import type { ChatType } from '@/interfaces'
import { getAuth } from 'firebase/auth'
import type {PropType, Ref} from 'vue'
import type {Timestamp as TimestampType } from "firebase/firestore";
import {ref} from "vue";
import {Timestamp} from 'firebase/firestore'

const props = defineProps({
  message: {
    type: Object as PropType<ChatType>,
    required: true
  },
  firebase:{
    type: Boolean,
    required: false
  }
})
const time:Ref<TimestampType> = ref(Timestamp.fromDate(new Date()))
if (props.firebase){
  time.value = props.message?.timestamp as Timestamp
}
</script>

<template>
  <div class="group" :class="message.sender.uid === getAuth().currentUser?.uid ? 'me-group' : ''">
    <div :class="message.sender.uid === getAuth().currentUser?.uid ? 'me' : ''">
      <h2>
        <slot></slot>
      </h2>
      <p>{{ message.text }}</p>
    </div>

    <p v-if="firebase" class="timestamp" :class="message.sender.uid === getAuth().currentUser?.uid ? 'meTime' : ''">
      {{ time.toDate().toLocaleString() }}
    </p>
    <p v-else class="timestamp" :class="message.sender.uid === getAuth().currentUser?.uid ? 'meTime' : ''">
      {{ message.timestamp }}
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
    border-radius: 20px 20px 0 20px;
    background: linear-gradient(93deg, #084eb8 0%, #052a61 100%);

    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>
