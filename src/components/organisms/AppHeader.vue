<script setup lang="ts">
import gsap from 'gsap'
import type { Ref } from 'vue'
import { ref } from 'vue'
import type { Auth } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import { useAuthStore } from '@/stores/AuthStore'

const auth: Auth = getAuth()
const authStore = useAuthStore()
const hamburgerToggle: Ref<boolean> = ref(false)

function ToggleHamButton(): void {
  hamburgerToggle.value = !hamburgerToggle.value
  const menu: HTMLElement | null = document.getElementById('menu')
  const expanded: boolean = menu?.getAttribute('aria-expanded') === 'true'
  const nav: HTMLElement | null = document.querySelector('#nav')

  menu?.setAttribute('aria-expanded', !expanded + '')

  if (menu?.getAttribute('aria-expanded') === 'true') {
    gsap.to(nav, {
      display: 'revert'
    })
    gsap.fromTo(
      nav,
      { y: -200 },
      {
        visibility: 'visible',
        y: 0,
        duration: 0.5,
        ease: 'ease'
      }
    )
  }

  if (menu?.getAttribute('aria-expanded') === 'false') {
    gsap.to(nav, {
      display: 'none'
    })
    gsap.fromTo(
      nav,
      { y: 0 },
      {
        y: -200,
        duration: 0.5,
        ease: 'ease'
      }
    )
  }
}
</script>

<template>
  <header>
    <router-link class="logo" :to="{ name: 'home' }">
      <img src="@/assets/images/Logo.svg" alt="2 rings intertwined" />
      <p>Odiconnect</p>
    </router-link>

    <button
      aria-label="navigation"
      @click="ToggleHamButton"
      aria-expanded="false"
      class="hamburger"
      id="menu"
    >
      <span aria-hidden="true" class="icon" :class="{ hamB: hamburgerToggle }">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>
    <nav v-if="!auth.currentUser" id="nav">
      <ul>
        <li>
          <router-link active-class="active" class="link" :to="{ name: 'home' }">Home</router-link>
        </li>
        <li>
          <router-link active-class="active" class="link" :to="{ name: 'login' }"
            >Login
          </router-link>
        </li>
        <li>
          <router-link active-class="active" class="link" :to="{ name: 'register' }"
            >Register
          </router-link>
        </li>
      </ul>
    </nav>

    <nav v-else id="nav">
      <ul>
        <li>
          <router-link active-class="active" class="link" :to="{ name: 'home' }">Home</router-link>
        </li>
        <li>
          <router-link active-class="active" class="link" :to="{ name: 'dashboard' }"
            >Dashboard
          </router-link>
        </li>
        <li @click="authStore.handleSignOut()" class="link">Logout</li>
      </ul>
    </nav>
  </header>
</template>

<style scoped lang="scss">
header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1em;

  nav {
    width: 100%;
    display: none;
  }

  ul {
    list-style: none;
    margin: 0;
    padding-left: 0;
    padding-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;

    .link {
      text-decoration: none;
      color: var(--foreground);
      font-size: 1.2em;
      font-style: normal;
      font-weight: 300;
      position: relative;
    }

    .link:hover {
      cursor: pointer;
      color: var(--accent);
      transition-duration: 0.2s;
    }

    .active:before {
      content: '';
      position: absolute;
      top: 0;
      right: -0.5rem;
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background-color: var(--accent);
    }
  }
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  text-decoration: none;
  color: var(--foreground);
  font-size: 1.2rem;

  img {
    width: 2rem;
  }
}

#menu {
  background: none;
  border: 0;
  cursor: pointer;

  .icon span {
    display: block;
    width: 2.6rem;
    height: 3px;
    background-color: var(--foreground);
    margin: 5px 0;
    transition: transform 0.2s ease-in-out;
    border-radius: 10px;
    transition-duration: 0.5s;
  }

  span:nth-of-type(1) {
    width: 1.3rem;
  }

  span:nth-of-type(3) {
    width: 1.95rem;
  }
}

.hamB {
  span:nth-of-type(1) {
    transform-origin: bottom;
    transform: rotatez(45deg) translate(0.2rem, -0.1rem);
    width: 1rem !important;
  }

  span:nth-of-type(2) {
    transform-origin: top;
    transform: rotatez(-45deg);
    width: 2rem !important;
  }

  span:nth-of-type(3) {
    transform-origin: bottom;
    width: 1rem !important;
    transform: rotatez(45deg) translate(0.5rem, -0.8rem);
  }
}

@media (min-width: 31.25em) {
  header {
    nav {
      width: fit-content;
      display: revert !important;
      transform: translate(0, 0) !important;

      ul {
        padding-top: 0;
      }
    }

    #menu {
      display: none;
    }
  }
}

@media (min-width: 56.25em) {
  header {
    padding: 2em 6em 0;
  }
}
</style>
