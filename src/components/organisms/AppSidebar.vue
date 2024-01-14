<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import BlueButton from '@/components/atoms/BlueButton.vue'
import { useFriendStore } from '@/stores/FriendStore'
import UserInfo from '@/components/molecules/UserInfo.vue'
import type { UserType } from '@/interfaces'

const friendStore = useFriendStore()
const expanded: Ref<boolean> = ref(localStorage.getItem('expanded') === 'true')
const ToggleMenu = (): void => {
  expanded.value = !expanded.value
  localStorage.setItem('expanded', String(expanded.value))
}
const setChat = (friend: UserType): void => {
  friendStore.currentFriend = friend
  friendStore.getChat()
}
</script>

<template>
  <aside :class="`${expanded ? 'expanded' : ''}`">
    <div class="toggle-Menu-wrap">
      <button @click="ToggleMenu">
        <i class="fa-solid fa-angles-right"></i>
      </button>
    </div>
    <div class="title-group">
      <h2>Friends</h2>
      <div class="add">
        <blue-button @click="friendStore.TogglePopUp('add')" id="add" type="button"
          >Add friend +
        </blue-button>
      </div>
    </div>

    <h3>
      Online --
      {{ friendStore.friends?.filter((user: UserType) => user.status === 'online').length }}
    </h3>
    <ul v-if="friendStore.friends?.filter((user: UserType) => user.status === 'online').length > 0">
      <li
        v-for="friend in friendStore.friends.filter((user: UserType) => user.status === 'online')"
        :key="friend.uid"
        @click="setChat(friend)"
      >
        <UserInfo :email="friend.email" :img="friend.img" :status="friend.status"
          >{{ friend.username }}
        </UserInfo>
      </li>
    </ul>
    <ul v-else>
      <li class="center">No online friends</li>
    </ul>
    <h3>
      Offline --
      {{ friendStore.friends?.filter((user: UserType) => user.status === 'offline').length }}
    </h3>
    <ul
      v-if="friendStore.friends?.filter((user: UserType) => user.status === 'offline').length > 0"
    >
      <li
        v-for="friend in friendStore.friends.filter((user: UserType) => user.status === 'offline')"
        :key="friend.uid"
        @click="setChat(friend)"
      >
        <UserInfo :email="friend.email" :img="friend.img" :status="friend.status"
          >{{ friend.username }}
        </UserInfo>
      </li>
    </ul>
    <ul v-else>
      <li class="center">No offline friends</li>
    </ul>
    <div class="flex"></div>

    <div @click="friendStore.TogglePopUp('pending')" class="settings">
      <i
        class="fa-solid fa-user-group"
        :class="friendStore.pending.length > 0 ? 'pending' : ''"
      ></i>
      <p>Pending</p>
    </div>

    <div class="settings">
      <i class="fa-solid fa-gear"></i>
      <p>Settings</p>
    </div>
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
  min-height: calc(100vh - 4rem);
  padding: 0.5rem;

  transition: 0.2s ease-in-out;

  .flex {
    flex: 1 1 0;
  }

  .toggle-Menu-wrap {
    display: flex;
    justify-content: center;

    transition: 0.2s ease-in-out;

    button:not(#add) {
      transition: 0.2s ease-in-out;

      i {
        color: var(--foreground);
        font-size: 1.5rem;
      }

      &:hover {
        cursor: pointer;
        transform: translateX(0.5rem);

        i {
          color: var(--accent);
        }
      }
    }
  }

  h2 {
    text-align: center;
    font-size: 1.8rem;
    font-weight: 400;
  }

  .title-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
  }

  .add {
    width: 2rem;
    min-width: 8rem;
    display: flex;
    justify-content: center;
    align-items: center;

    button {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      font-size: 1.1rem;
    }
  }

  h3 {
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--light-grey);
    padding-bottom: 0.2rem;
    border-bottom: solid 1px var(--light-grey);
    min-width: 6rem;
  }

  .settings {
    font-size: 1.2rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 0.7rem;
    margin-left: calc((100% - 1.4rem) / 2);
    cursor: pointer;

    i.fa-user-group {
      margin-left: calc((100% - 1.8rem) / 2);
    }
  }

  h2,
  h3,
  .settings > p,
  .add,
  ul {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  &.expanded {
    width: 19rem;

    .toggle-Menu-wrap {
      justify-content: flex-end;

      button:not(#add) {
        transform: rotate(-180deg);

        &:hover {
          transform: rotate(-180deg) translateX(0.5rem);
        }
      }
    }

    h2,
    h3,
    .settings > p,
    .add,
    ul {
      opacity: 1;
    }

    .settings {
      gap: 1.5rem;
      margin-left: 0;

      i.fa-user-group {
        margin-left: 0;
      }
    }
  }

  @media (max-width: 1024px) {
    position: absolute;
  }
}

button:not(#add) {
  background: none;
  border: none;
}

.pending {
  position: relative;
}

.pending:after {
  content: '';
  position: absolute;
  top: -0.3rem;
  right: -0.5rem;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background-color: var(--accent);
  animation: blink 3s infinite;
}

ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;

  .center {
    text-align: center;
  }

  li {
    cursor: pointer;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;

    &:hover {
      background-color: rgba(30, 31, 34, 0.32);
    }
  }
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  25% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  75% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
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
