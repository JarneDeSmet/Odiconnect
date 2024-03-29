<script setup lang="ts">
import type {Ref} from 'vue'
import {onUnmounted, ref, watch} from 'vue'
import FormField from '@/components/molecules/FormField.vue'
import ChatBubble from '@/components/atoms/chatBubble.vue'
import type {ChatType} from '@/interfaces'
import {Timestamp} from 'firebase/firestore'
import {useAuthStore} from "@/stores/AuthStore";
import {useBunStore} from "@/stores/BunStore";
import {useTensorflowStore} from "@/stores/TensorflowStore";

const expanded: Ref<boolean> = ref(localStorage.getItem('expanded') === 'true')
const message: Ref<string> = ref('')
const authStore = useAuthStore()
const bunStore = useBunStore()
const tensorStore = useTensorflowStore()

const ToggleMenu = (): void => {
  expanded.value = !expanded.value
  localStorage.setItem('expanded', String(expanded.value))
}

const sendChatMessage = (): void => {
  if (message.value) {
    const data: ChatType = {
      sender: {
        email: authStore.user!.email,
        username: authStore.user!.username,
        uid: authStore.user!.uid
      },
      text: message.value,
      timestamp: Timestamp.fromDate(new Date()).toDate().toLocaleString()

    };
    bunStore.dataChannel?.send(JSON.stringify(data));

    displayMessage(data);

  }
};
const displayMessage = (data: ChatType): void => {
  bunStore.messages.push(data)
  message.value = ''

}

const unwatch = watch(
    () => tensorStore.emoji,
    () => {
      if (tensorStore.emoji) {
        if (tensorStore.emoji === 'i_love_you') {
          message.value = '❤️'
        } else if (tensorStore.emoji === 'thumbs_up') {
          message.value = '👍'
        } else if (tensorStore.emoji === 'victory') {
          message.value = '✌️'
        }
      }
    }
)

onUnmounted((): void => {
  unwatch()
})
</script>

<template>
  <aside :class="`${expanded ? 'expanded' : ''}`">
    <div class="toggle-Menu-wrap">
      <button @click="ToggleMenu">
        <i class="fa-solid fa-angles-left"></i>
      </button>
    </div>

    <div v-if=" bunStore.messages" class="chat">
      <ul v-for="mes in bunStore.messages" :key="mes?.text" class="messages">
        <li v-if="mes">
          <chat-bubble :message="mes">{{ mes?.sender.username }}</chat-bubble>
        </li>

      </ul>
    </div>
    <form @submit.prevent="sendChatMessage">
      <form-field id="" v-model="message" type="text"/>
    </form>
  </aside>
</template>

<style scoped lang="scss">
aside {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  background: var(--background-dark);
  box-shadow: 2px 0 15px 0 rgba(20, 110, 245, 0.16);
  width: 2.5rem;
  overflow: hidden;
  min-height: calc(100vh - 3.5rem);

  padding-right: 0;
  padding-top: 0.5rem;
  padding-left: 0.5rem;

  transition: 0.2s ease-in-out;

  .toggle-Menu-wrap {
    display: flex;
    justify-content: center;

    transition: 0.2s ease-in-out;

    button {
      transition: 0.2s ease-in-out;

      i {
        color: var(--foreground);
        font-size: 1.5rem;
      }

      &:hover {
        cursor: pointer;
        transform: translateX(-0.5rem);

        i {
          color: var(--accent);
        }
      }
    }
  }

  ul,
  form {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  &.expanded {
    width: 19rem;

    .toggle-Menu-wrap {
      justify-content: flex-start;

      button {
        transform: rotate(180deg);

        &:hover {
          transform: rotate(180deg) translateX(-0.5rem);
        }
      }
    }

    ul,
    form {
      opacity: 1;
    }
  }

  @media (max-width: 1024px) {
    position: absolute;
    right: 0;
  }
}

.chat {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-height: calc(100vh - 9.5rem);

  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    list-style: none;
    margin-top: 1rem;
    margin-left: 0;
    padding-left: 0;
    padding-right: 0.5rem;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      width: 7px;
    }

    &::-webkit-scrollbar-track {
      background: var(--background);
      border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--accent);
      border-radius: 5px;

      &:hover {
        background: #0447a9;
      }
    }
  }
}

form {
  margin-top: 0.5rem;
  margin-right: 0.5rem;
}

button {
  background: none;
  border: none;
  padding: 0;
}

@media (max-width: 19.375rem) {
  aside {
    width: 2.5rem;

    &.expanded {
      width: 16rem;
    }
  }
}
</style>
