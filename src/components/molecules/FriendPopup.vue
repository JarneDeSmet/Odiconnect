<script setup lang="ts">
import { useAuthStore } from '@/stores/AuthStore'
import { useFriendStore } from '@/stores/FriendStore'
import FormField from '@/components/molecules/FormField.vue'
import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import type { UserType } from '@/interfaces'
import UserInfo from '@/components/molecules/UserInfo.vue'
import BlueButton from '@/components/atoms/BlueButton.vue'

const authStore = useAuthStore()
const friendStore = useFriendStore()

const search: Ref<string> = ref('')
const text: Ref<string> = ref('')

const filteredArray = computed((): Array<UserType> => {
  const searchTerm: string = search.value.toLowerCase()

  if (friendStore.friendPopUp === 'add') {
    return authStore.allUsers.filter((user: UserType) => {
      return user.username.toLowerCase().includes(searchTerm)
    })
  } else if (friendStore.friendPopUp === 'pending') {
    return friendStore.pending.filter((user: UserType) => {
      return user.username.toLowerCase().includes(searchTerm)
    })
  } else {
    return []
  }
})

const closePopUp = (): void => {
  if (friendStore.friendPopUp === 'add') text.value = 'friend request sent'
  setTimeout(() => {
    friendStore.TogglePopUp('closed')
    text.value = ''
  }, 1000)
}
</script>

<template>
  <div class="overlay">
    <Transition appear name="slide-fade">
      <div class="inner">
        <i @click="friendStore.TogglePopUp('closed')" class="fa-solid fa-x"></i>
        <h2>
          <slot></slot>
        </h2>
        <p class="text" v-if="text">{{ text }}</p>
        <FormField
          class="input"
          id=""
          v-model="search"
          type="text"
          placeholder="User6748"
        ></FormField>

        <ul v-if="filteredArray.length > 0">
          <li v-for="user in filteredArray" :key="user.username">
            <UserInfo :email="user.email" :img="user.img" :status="user.status">{{
              user.username
            }}</UserInfo>
            <div class="buttons">
              <div class="add">
                <blue-button
                  v-if="friendStore.friendPopUp === 'add'"
                  @click="friendStore.sendFriendRequest(user).then(closePopUp)"
                  type="button"
                  >Add +
                </blue-button>
                <blue-button v-else @click="friendStore.confirmFriendRequest(user)" type="button"
                  >Add +
                </blue-button>
              </div>
              <button
                @click="friendStore.declineFriendRequest(user)"
                v-if="friendStore.friendPopUp === 'pending'"
                class="decline"
              >
                X
              </button>
            </div>
          </li>
        </ul>

        <div class="noUsers" v-else>
          <p v-if="friendStore.friendPopUp === 'add'">No users to add</p>
          <p v-else>No pending requests</p>
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

.noUsers {
  text-align: center;
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

    i {
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

.input {
  margin-top: 1rem;
  margin-bottom: 2rem;
}

ul {
  max-height: 20rem;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  li {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.add {
  max-width: 8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  button {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    font-size: 1.1rem;
  }
}

.buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .decline {
    color: var(--foreground);
    background-color: var(--red);
    border: none;
    width: 1.5rem;
    height: 1.5rem;

    &:hover {
      cursor: pointer;
      background-color: #d30101;
    }
  }
}

.text {
  text-align: center;
  color: var(--accent);
  margin-top: 0.5rem;
}

@media (min-width: 30.625rem) {
  ul {
    li {
      flex-direction: row;
      align-items: center;
    }
  }
}
</style>
