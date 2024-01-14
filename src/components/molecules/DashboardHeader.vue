<script setup lang="ts">
import { useAuthStore } from '@/stores/AuthStore'

const authStore = useAuthStore()
</script>

<template>
  <header>
    <RouterLink class="logo" :to="{ name: 'home' }">
      <img src="@/assets/images/Logo.svg" alt="2 rings intertwined" />
      <p>Odiconnect</p>
    </RouterLink>

    <nav id="nav">
      <ul>
        <li class="link" @click="authStore.toggleAccount">
          <img :src="authStore.user?.img" alt="profile picture" />
          <p>{{ authStore.user?.username }}</p>
        </li>
        <li>
          <RouterLink class="link" :to="{ name: 'dashboard' }"> Dashboard</RouterLink>
        </li>
        <li @click="authStore.handleSignOut()" class="logoutText">Logout</li>
        <li @click="authStore.handleSignOut()" class="logoutIcon">
          <i class="fa-solid fa-right-from-bracket"></i>
        </li>
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
  padding: 0.5rem 0.5rem;
  background-color: #1e1f22;
  font-size: 1.2rem;
  position: relative;
  z-index: 2;

  .link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--foreground);
    transition-duration: 0.2s;

    &:hover {
      cursor: pointer;
      color: var(--accent);
      transition-duration: 0.2s;
    }

    p {
      display: none;
    }
  }

  #nav {
    ul {
      padding: 0;
      display: flex;
      align-items: center;
      list-style: none;
      font-weight: 400;

      li {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        border-left: solid 2px var(--foreground);
        transition-duration: 0.2s;

        &:hover {
          cursor: pointer;
          color: var(--accent);
          transition-duration: 0.2s;
        }
      }

      li:first-child {
        border-left: none;
      }

      li:last-child {
        padding-right: 0;
        border-right: none;
      }
    }

    img {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      object-fit: cover;
    }
  }
}
.logoutText {
  display: none;
}
.logoutIcon {
  display: block;
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
    width: 2.5rem;
  }

  p {
    display: none;
  }
}

@media (min-width: 31.25em) {
  header {
    .link > p {
      display: block;
    }
  }

  .logoutIcon {
    display: none;
  }

  .logoutText {
    display: block;
  }
}

@media (min-width: 56.25em) {
  header {
    padding: 0.5rem 2em;
  }
  .logo > p {
    display: block;
  }
}
</style>
