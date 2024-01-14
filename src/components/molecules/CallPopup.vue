<script setup lang="ts">
import { useAuthStore } from '@/stores/AuthStore'
import { useBunStore } from '@/stores/BunStore'
import type { UserType } from '@/interfaces'
import type { Ref } from 'vue'
import { ref } from 'vue'

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
        <h3>{{ caller.username }} is calling</h3>
        <div class="buttons">
          <button @click="bunStore.AcceptCall(caller.uid)">Accept</button>
          <button @click="bunStore.DeclineCall(caller.uid)">Decline</button>
        </div>
      </div>

      <div v-else class="inner">
        <h3>calling {{ caller.username }}</h3>
        <div class="buttons">
          <button @click="bunStore.DeclineCall(caller.uid)">Cancel</button>
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
    min-height: 70%;
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

    p {
      text-align: center;
      font-weight: 300;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
  }
}

.img {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: fit-content;

  img {
    width: 4rem;
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: 50%;

    &:hover {
      filter: brightness(50%);
      cursor: pointer;
    }
  }

  i {
    position: absolute;
    margin-left: 3rem;
    margin-top: 3rem;
  }
}

form {
  margin-left: auto;
  margin-right: auto;
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;

  .btn {
    width: 100%;
    margin-top: 2rem;
  }
}

#image {
  display: none;
}

.dropdown {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.3rem;
  font-weight: 400;
  width: 100%;

  select {
    background: #1e1f22;
    border: none;
    padding-top: 0.7rem;
    padding-bottom: 0.7rem;
    padding-left: 0.5rem;
    color: var(--foreground);

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
