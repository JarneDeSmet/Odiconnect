<script setup lang="ts">
import { useAuthStore } from '@/stores/AuthStore'
import FormField from '@/components/molecules/FormField.vue'
import BlueButton from '@/components/atoms/BlueButton.vue'
import { computed, ref } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase-service'
import { getDownloadURL, getStorage, ref as strRef, uploadBytes } from 'firebase/storage'

const authStore = useAuthStore()

const profile_picture: Ref = ref()
const submitted: Ref<boolean> = ref(false)
const nameError: ComputedRef = computed(nameErr)

function nameErr(): string | undefined {
  if (!submitted.value) return
  if (!authStore.user?.username) return 'name is not filled in'
}

const trySave = async (): Promise<void> => {
  submitted.value = true

  if (profile_picture.value) {
    const storage = getStorage()
    const storageRef = strRef(storage, authStore.user?.uid)

    await uploadBytes(storageRef, profile_picture.value).then(() => {
      console.log('Uploaded a blob or file!')
    })
    await getDownloadURL(strRef(storage, authStore.user?.uid)).then(async (data) => {
      authStore.user!.img = data
    })
  }
  if (!nameError.value && authStore.user) {
    await updateDoc(doc(db, 'Users', authStore.user.uid), {
      username: authStore.user.username,
      status: authStore.user.status,
      img: authStore.user.img
    })

    authStore.toggleAccount()
  }
}

const handleImageSelected = (e: Event): void => {
  profile_picture.value = (e.target as HTMLInputElement).files?.[0]

  if (authStore.user) {
    authStore.user.img = URL.createObjectURL(profile_picture.value)
  }
}
</script>

<template>
  <div class="overlay">
    <Transition appear name="slide-fade">
      <div class="inner">
        <i @click="authStore.toggleAccount" class="fa-solid fa-x"></i>
        <h2>
          <slot></slot>
        </h2>
        <p>{{ authStore.user?.email }}</p>

        <form v-if="authStore.user" @submit.prevent="trySave">
          <label for="image" class="img">
            <img :src="authStore.user?.img" alt="profile pic" />
            <i class="fa-solid fa-pen-to-square edit"></i>
          </label>
          <input
            ref="image"
            type="file"
            id="image"
            @change="handleImageSelected"
            accept="image/png, image/jpeg"
          />

          <FormField
            id="Username"
            v-model="authStore.user.username"
            type="text"
            :error="nameError"
          />

          <label class="dropdown" for="status"
            >Status
            <select name="status" id="status" v-model="authStore.user.status">
              <option value="online" :selected="authStore.user.status === 'online'">Online</option>
              <option value="offline" :selected="authStore.user.status === 'offline'">
                Offline
              </option>
            </select>
          </label>
          <blue-button class="btn" type="submit">Save</blue-button>
        </form>
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
