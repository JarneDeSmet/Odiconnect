<script setup lang="ts">
import AppHeader from '@/components/organisms/AppHeader.vue'
import BlueButton from '@/components/atoms/BlueButton.vue'
</script>

<template>
  <body>
    <AppHeader />
    <main>
      <div>
        <Transition appear name="slide-fade">
          <h1>Odiconnect</h1>
        </Transition>
        <Transition appear name="slide-fade2">
          <h2>Connect, call and chat with your friends !</h2>
        </Transition>
      </div>
      <Transition appear name="slide-fade-up">
        <div>
          <router-link :to="{ name: 'login' }">
            <blue-button type="button">Login</blue-button>
          </router-link>
          <router-link :to="{ name: 'register' }">
            <blue-button type="button">Register</blue-button>
          </router-link>
        </div>
      </Transition>
    </main>
  </body>
</template>

<style lang="scss" scoped>
body {
  height: 100vh;
  background: center / cover url('../assets/images/Background.png') fixed no-repeat;
}

div:first-child {
  margin-left: 1em;
  margin-right: 1em;
  margin-top: 2em;
}

div:nth-child(2) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
}

h1 {
  font-size: 2.9em;
  font-weight: 400;
  text-align: center;
  margin: 0;
}

h2 {
  font-size: 1.4em;
  font-weight: 200;
  text-align: center;
  margin: 0;
}

@media (min-width: 31.25em) {
  h1 {
    font-size: 3.5em;
    margin-top: 4rem;
  }
  h2 {
    font-size: 2em;
  }
}

@media (min-width: 56.25em) {
  div:nth-child(2) {
    flex-direction: row;
    margin-top: 5rem;
    gap: 6rem;
  }
}

.slide-fade-enter-active {
  transition: all 0.5s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-60px);
  opacity: 0;
}

.slide-fade2-enter-active {
  transition: all 0.5s ease-out;
  transition-delay: 0.4s;
}

.slide-fade2-enter-from,
.slide-fade2-leave-to {
  transform: translateX(-60px);
  opacity: 0;
}

.slide-fade-up-enter-active {
  transition: all 0.5s ease-out;
}

.slide-fade-up-enter-from,
.slide-fade-up-leave-to {
  transform: translateY(60px);
  opacity: 0;
}
</style>
