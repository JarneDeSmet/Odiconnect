<script setup lang="ts">
import {useAuthStore} from '@/stores/AuthStore'
import {useBunStore} from '@/stores/BunStore'
import type {UserType} from '@/interfaces'
import BlueButton from "@/components/atoms/BlueButton.vue";

const authStore = useAuthStore()
const bunStore = useBunStore()

const caller: UserType | undefined = authStore.allUsers.find(
    (user) => user.uid === authStore.user?.calls.id
)
</script>

<template>
  <div v-if="caller" class="overlay">
    <Transition appear name="slide-fade">
      <div v-if="authStore.user?.calls.caller !== 'me'" class="inner">
        <h2>{{ caller.username }} is calling</h2>
        <div class="buttons">
          <blue-button @click="bunStore.AcceptCall(caller.uid)" type="button">Accept</blue-button>
          <blue-button @click="bunStore.DeclineCall(caller.uid)" type="button">Decline</blue-button>

        </div>
      </div>

      <div v-else class="inner">
        <h2>calling {{ caller.username }}</h2>
        <div class="buttons">
          <blue-button @click="bunStore.DeclineCall(caller.uid)" type="button">Cancel</blue-button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.slide-fade-enter-active {
  transition: all 0.35s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(60px);
  opacity: 0;
}

.overlay {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.54);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  transition: 2s ease-in-out;
  overflow-y: scroll;

  .inner {
    position: relative;
    width: 100%;
    max-width: 30rem;
    margin: 5rem 1rem 0;
    background-color: #2b2d31;
    color: var(--foreground);
    padding: 0.5rem 1rem 2rem;
    min-height: 50%;
    border-radius: 3px;

    i:not(.edit) {
      position: absolute;
      top: 0.5rem;
      right: 1rem;
      transition: 0.2s ease-in-out;
      font-size: 1.2rem;

      &:hover {
        transition: 0.2s ease-in-out;
        color: var(--accent);
        cursor: pointer;
      }
    }

    h2 {
      text-align: center;
      font-weight: 400;
    }

  }
}

.buttons{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2rem;

  margin-top: 5rem;
}
</style>
