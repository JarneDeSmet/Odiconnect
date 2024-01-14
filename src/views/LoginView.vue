<script setup lang="ts">
import AppHeader from '@/components/organisms/AppHeader.vue'
import FormField from '@/components/molecules/FormField.vue'
import BlueButton from '@/components/atoms/BlueButton.vue'

import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import router from '@/router'
import {
  setPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  getAuth,
  signInWithEmailAndPassword
} from 'firebase/auth'
import type { FirebaseError } from '@firebase/util'
import { useAuthStore } from '@/stores/AuthStore'

const authStore = useAuthStore()
const auth = getAuth()

const submitted: Ref<boolean> = ref(false)
const email: Ref<string> = ref('')
const password: Ref<string> = ref('')
const error: Ref<string> = ref('')
const keepLoggedIn = ref(false)

const emailError = computed(emailErr)
const passwordError = computed(passwordErr)

function emailErr() {
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!submitted.value) return
  if (!email.value) return 'Email is not filled in'
  if (!emailRegex.test(email.value)) return 'Email invalid, did you forget @ or . ?'
}

function passwordErr() {
  if (!submitted.value) return
  if (!password.value) return 'Password is not filled in'
}

const tryLogin = async (): Promise<void> => {
  submitted.value = true

  if (!emailError.value && !passwordError.value) {
    if (keepLoggedIn.value) {
      await setPersistence(auth, indexedDBLocalPersistence)
    } else {
      await setPersistence(auth, browserSessionPersistence)
    }

    signInWithEmailAndPassword(getAuth(), email.value, password.value)
      .then(async () => {
        submitted.value = false
        email.value = ''
        password.value = ''
        authStore.getUser()
        await router.push({ name: 'dashboard' })
      })
      .catch((err: FirebaseError) => {
        switch (err.code) {
          case 'auth/invalid-email':
            error.value = 'Invalid email address'
            break
          case 'auth/user-not-found':
            error.value = 'No account with that email was found'
            break
          case 'auth/wrong-password':
            error.value = 'Incorrect password'
            break
          default:
            error.value = 'Email or password was incorrect'
            break
        }
      })
  }
}
</script>

<template>
  <body>
    <AppHeader />
    <main>
      <form @submit.prevent="tryLogin">
        <p v-if="error" class="field-error">{{ error }}</p>
        <h1>Login</h1>
        <div>
          <form-field
            v-model="email"
            id="E-mail"
            type="email"
            placeholder="name@example.com"
            :error="emailError"
          />
          <form-field v-model="password" id="Password" type="password" :error="passwordError" />

          <div class="remember">
            <input v-model="keepLoggedIn" id="remember" type="checkbox" />
            <label for="remember">Stay logged in</label>
          </div>
        </div>

        <blue-button class="btn" type="submit">Login</blue-button>
      </form>
    </main>
  </body>
</template>

<style scoped>
body {
  min-height: 100vh;
  background: center / cover url('../assets/images/BackgroundBlurred.png') fixed no-repeat;
}

.field-error {
  color: var(--red);
  font-weight: 400;
}

form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(49, 51, 56, 0.74);
  border-radius: 5px;
  margin: 1.5rem 1rem;
  padding: 1rem 0.5rem 3rem;

  h1 {
    margin-bottom: 2.5rem;
    font-weight: 300;
  }

  div:not(.remember) {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;
    margin-bottom: 6rem;
  }
}

.btn {
  width: 100%;
}

.remember {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;

  label {
    cursor: pointer;
    font-weight: 300;
    color: var(--foreground);
  }
}

@media (min-width: 30rem) {
  form {
    max-width: 27rem;
    margin-left: auto;
    margin-right: auto;

    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
</style>
