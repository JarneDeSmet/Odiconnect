<script setup lang="ts">
import AppSidebar from '@/components/organisms/AppSidebar.vue'
import DashboardHeader from '@/components/molecules/DashboardHeader.vue'
import FriendPopup from '@/components/molecules/FriendPopup.vue'
import {useFriendStore} from '@/stores/FriendStore'
import {onMounted, onUnmounted, ref, watch} from 'vue'
import type {Ref} from 'vue'
import UserInfo from '@/components/molecules/UserInfo.vue'
import gsap from 'gsap'
import FormField from '@/components/molecules/FormField.vue'
import ChatBubble from '@/components/atoms/chatBubble.vue'
import AccountPopup from '@/components/molecules/AccountPopup.vue'
import {useAuthStore} from '@/stores/AuthStore'
import {useBunStore} from '@/stores/BunStore'
import CallPopup from '@/components/molecules/CallPopup.vue'
import router from '@/router'

const friendStore = useFriendStore()
const authStore = useAuthStore()
const bunStore = useBunStore()

onMounted(async () => {
  authStore.getUser()

  friendStore.getFriends()
  friendStore.getPending()

})

const hamburgerToggle: Ref<boolean> = ref(false)
const message: Ref<string> = ref('')

function ToggleHamButton(): void {
  hamburgerToggle.value = !hamburgerToggle.value
  const dotsbtn: HTMLElement | null = document.getElementById('dots-btn')
  const expanded: boolean = dotsbtn?.getAttribute('aria-expanded') === 'true'
  const ul: HTMLElement | null = document.querySelector('#ul')

  dotsbtn?.setAttribute('aria-expanded', !expanded + '')

  if (dotsbtn?.getAttribute('aria-expanded') === 'true') {
    gsap.to(ul, {
      display: 'flex'
    })
    gsap.fromTo(
        ul,
        {x: 200},
        {
          visibility: 'visible',
          x: 0,
          duration: 0.5,
          ease: 'ease'
        }
    )
  }

  if (dotsbtn?.getAttribute('aria-expanded') === 'false') {
    gsap.to(ul, {
      display: 'none'
    })
    gsap.fromTo(
        ul,
        {x: 0},
        {
          x: 200,
          duration: 0.5,
          ease: 'ease'
        }
    )
  }
}

const trysend = (): void => {
  if (message.value) {
    friendStore.sendMessage(message.value).then(() => (message.value = ''))
  }
}

const call: Ref<boolean> = ref(false)
const unwatch = watch(
    () => authStore.user,
    () => {
      if (authStore.user?.calls) {
        if (authStore.user.calls.status === 'pending') call.value = true
        if (authStore.user.calls.status === 'accepted') {
          call.value = false
          router.push({name: 'call'})
        }
      } else {
        call.value = false
      }
    }
)
onUnmounted(() => {
  unwatch()
})
</script>

<template>
  <CallPopup v-if="call"></CallPopup>
  <account-popup v-if="authStore.accountPopup">Account</account-popup>
  <friend-popup v-if="friendStore.friendPopUp === 'add'">Add friend</friend-popup>
  <friend-popup v-if="friendStore.friendPopUp === 'pending'">Friend requests</friend-popup>
  <DashboardHeader/>
  <main>
    <app-sidebar/>
    <div class="chat">
      <div v-if="friendStore.currentFriend" class="header">
        <UserInfo
            :status="friendStore.currentFriend?.status"
            :email="friendStore.currentFriend?.email"
            :img="friendStore.currentFriend?.img"
        >{{ friendStore.currentFriend?.username }}
        </UserInfo>
        <button
            aria-label="navigation"
            @click="ToggleHamButton"
            aria-expanded="false"
            class="hamburger"
            id="dots-btn"
        >
          <span aria-hidden="true" class="icon" :class="{ hamB: hamburgerToggle }">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <ul class="icons" id="ul">
          <li><img src="@/assets/images/call.png" alt="icon of a phone in grey"/></li>
          <li @click="bunStore.CallPeer">
            <img src="@/assets/images/videoCall.png" alt="icon of a camera in grey"/>
          </li>
          <li @click="friendStore.unFriend()">
            <img src="@/assets/images/unFriend.png" alt="icon of a man in grey"/>
          </li>
        </ul>
      </div>
      <ul class="messages">
        <li v-for="chatMessage in friendStore.chat.slice().reverse()" :key="chatMessage.text">
          <chat-bubble :firebase="true" :message="chatMessage">{{ chatMessage.sender?.username }}</chat-bubble>
        </li>
      </ul>


      <form @submit.prevent="trysend" class="sendMessage">
        <FormField id="" v-model="message" type="text"/>
        <button type="submit">
          <span>send message</span>
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
}

.chat {
  margin-top: 0.5rem;
  margin-left: 2.8rem;
  margin-bottom: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  max-height: calc(100vh - 5.5rem);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: 0.5rem;
  flex-wrap: wrap;

  .icons {
    list-style: none;
    width: 100%;
    justify-content: center;
    gap: 1rem;
    margin-left: 0;
    margin-top: 0.5rem;
    padding: 0;
    display: none;
    transition-duration: 0.2s;

    li:hover {
      cursor: pointer;
      transform: scale(1.1);
      transition-duration: 0.2s;
    }

    img {
      width: 2rem;
    }
  }
}

#dots-btn {
  background: none;
  border: 0;
  cursor: pointer;

  .icon span {
    display: block;
    width: 0.4rem;
    height: 0.4rem;
    background-color: var(--foreground);
    margin: 5px 0;
    border-radius: 50%;
  }
}

.sendMessage {
  position: relative;
  margin-right: 0.5rem;
  margin-top: 1rem;

  button {
    height: 100%;
    aspect-ratio: 1/1;
    position: absolute;
    right: 0;
    top: 0;
    background-color: var(--accent);
    color: var(--foreground);
    border: none;

    span {
      display: none;
    }
  }
}

.messages {
  list-style: none;
  margin-top: 0.5rem;
  margin-left: 0.2rem;
  padding: 0 0.5rem 0 0;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  overflow-y: scroll;
  flex-grow: 1;

  &::-webkit-scrollbar {
    width: 7px;
  }

  &::-webkit-scrollbar-track {
    background: var(--background-dark);
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

@media (min-width: 31.25em) {
  .header {
    .icons {
      width: fit-content;
      display: flex !important;
      transform: translate(0, 0) !important;
      margin: 0;
    }

    #dots-btn {
      display: none;
    }
  }

  .sendMessage {
    button {
      aspect-ratio: revert;

      span {
        display: block;
      }

      i {
        display: none;
      }
    }
  }
}

@media (min-width: 1024px) {
  .chat {
    margin-left: 2rem;
  }
}

@media (min-width: 56.25em) {
  .chat {
    margin-right: 2rem;
  }
}
</style>
