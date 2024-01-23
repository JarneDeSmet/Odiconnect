<script setup lang="ts">
import AppHeader from '@/components/organisms/AppHeader.vue'
import FormField from '@/components/molecules/FormField.vue'
import BlueButton from '@/components/atoms/BlueButton.vue'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { FirebaseError } from '@firebase/util'
import { useAuthStore } from '@/stores/AuthStore'
import router from '@/router'
import { db } from '@/firebase-service'

const auth = getAuth()
const authStore = useAuthStore()

const submitted: Ref<boolean> = ref(false)
const username: Ref<string> = ref('')
const email: Ref<string> = ref('')
const password: Ref<string> = ref('')
const repeat: Ref<string> = ref('')
const error: Ref<string> = ref('')

const usernameError = computed(usernameErr)
const emailError = computed(emailErr)
const passwordError = computed(passwordErr)
const repeatError = computed(repeatErr)

function usernameErr(): string | undefined {
  if (!submitted.value) return
  if (!username.value) return 'Username is not filled in'
}

function emailErr(): string | undefined {
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!submitted.value) return
  if (!email.value) return 'Email is not filled in'
  if (!emailRegex.test(email.value)) return 'Email invalid, did you forget @ or . ?'
}

function passwordErr(): string | undefined {
  if (!submitted.value) return
  if (!password.value) return 'Password is not filled in'
  return checkPassword(password.value)
}

function repeatErr(): string | undefined {
  if (!submitted.value) return
  if (!repeat.value) return 'Repeat password is not filled in'
  if (repeat.value !== password.value) return 'Passwords do not match'
   return checkPassword(password.value)
}

function checkPassword(password: string): string | undefined {
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one capital letter'
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one number'
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password must contain at least one symbol'
  }
}

const tryRegister = (): void => {
  submitted.value = true

  if (!usernameError.value && !emailError.value && !passwordError.value && !repeatError.value) {
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then(async () => {
        if (auth?.currentUser) {
          updateProfile(auth?.currentUser, {
            displayName: username.value
          })
            .then(async () => {
              await setDoc(doc(db, 'Users', auth.currentUser!.uid), {
                uid: auth.currentUser?.uid,
                username: auth.currentUser?.displayName,
                email: auth.currentUser?.email,
                status: 'online',
                friends: [],
                requests: [],
                img: './src/assets/images/Profile-placeholder.png'
              })
            })
            .catch((err: FirebaseError) => {
              error.value = err.message
            })
        }
      })
      .then(() => {
        username.value = ''
        email.value = ''
        password.value = ''
        repeat.value = ''
        authStore.getUser()
        router.push({ name: 'dashboard' })
      })
      .catch((err: FirebaseError) => {
        error.value = err.message
      })
  }
}
</script>

<template>
  <body>
    <AppHeader />
    <main>
      <form @submit.prevent="tryRegister">
        <span class="field-error" v-if="error">{{ error }}</span>
        <h1>Register</h1>
        <div>
          <form-field
            v-model="username"
            id="Username"
            type="text"
            :error="usernameError"
            placeholder="User924"
          />
          <form-field
            v-model="email"
            id="E-mail"
            type="email"
            placeholder="name@example.com"
            :error="emailError"
          />
          <form-field v-model="password" id="Password" type="password" :error="passwordError" />
          <form-field v-model="repeat" id="Repeat" type="password" :error="repeatError" />
        </div>

        <blue-button class="btn" type="submit">Register</blue-button>
      </form>
    </main>
  </body>
</template>

<style scoped>
body {
  min-height: 100vh;
  height: 100%;
  background: center / cover url('../assets/images/BackgroundBlurred.png') fixed no-repeat;

  main {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
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
  margin: 1.5rem 1rem 2rem;
  padding: 1rem 0.5rem 3rem;

  h1 {
    margin-bottom: 2.5rem;
    font-weight: 300;
  }

  div {
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

@media (min-width: 30rem) {
  form {
    width: 100%;
    max-width: 27rem;
    margin-left: auto;
    margin-right: auto;

    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
</style>
