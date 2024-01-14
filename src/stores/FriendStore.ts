import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import type { Auth, Unsubscribe } from 'firebase/auth'
import type { ChatType, UserType } from '@/interfaces'

import { onUnmounted, ref, warn, watch } from 'vue'
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  setDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase-service'
import { getAuth } from 'firebase/auth'
import { useAuthStore } from '@/stores/AuthStore'

export const useFriendStore = defineStore('friends', () => {
  const friendPopUp: Ref<string> = ref('closed')
  const auth: Auth = getAuth()
  const authStore = useAuthStore()
  const currentFriend: Ref<UserType | null> = ref(null)
  const friends: Ref<UserType[]> = ref([])
  const pending: Ref<UserType[]> = ref([])
  const chat: Ref<ChatType[] | []> = ref([])
  let unsubscribePending: Unsubscribe | null = null
  let unsubscribeFriends: Unsubscribe | null = null
  let unsubscribeChat: Unsubscribe | null = null

  const getPending = (): void => {
    if (authStore.user) {
      if (unsubscribePending) {
        unsubscribePending()
      }
      if (authStore.user.requests.length > 0) {
        unsubscribePending = onSnapshot(
          query(collection(db, 'Users'), where('uid', 'in', authStore.user?.requests)),
          (snapshot): void => {
            pending.value = snapshot.docs.map((doc) => ({ ...doc.data() })) as UserType[]
          }
        )
      } else {
        pending.value = []
      }
    }
  }

  const getFriends = (): void => {
    if (authStore.user) {
      if (unsubscribeFriends) {
        unsubscribeFriends()
      }
      if (authStore.user.friends.length > 0) {
        unsubscribeFriends = onSnapshot(
          query(collection(db, 'Users'), where('uid', 'in', authStore.user?.friends)),
          (snapshot): void => {
            friends.value = snapshot.docs.map((doc) => ({ ...doc.data() })) as UserType[]
          }
        )
      } else {
        friends.value = []
      }
    }
  }

  const getChat = (): void => {
    if (auth.currentUser && currentFriend.value) {
      if (unsubscribeChat) {
        unsubscribeChat()
      }
      const combiID: string =
        auth.currentUser.uid > currentFriend.value?.uid
          ? auth.currentUser.uid + currentFriend.value.uid
          : currentFriend.value.uid + auth.currentUser.uid
      unsubscribeChat = onSnapshot(doc(collection(db, 'chats'), combiID), (docSnapshot) => {
        if (docSnapshot.exists()) {
          chat.value = docSnapshot.data().messages as ChatType[]
        } else {
          chat.value = []
        }
      })
    }
  }

  const TogglePopUp = (type: string): void => {
    if (friendPopUp.value !== 'closed') {
      friendPopUp.value = 'closed'
    } else {
      friendPopUp.value = type
    }
  }

  const sendFriendRequest = async (user: UserType): Promise<void> => {
    console.log(auth.currentUser?.uid)
    await updateDoc(doc(db, 'Users', user.uid), {
      requests: arrayUnion(auth.currentUser?.uid)
    }).catch((err) => warn(err))
  }

  const confirmFriendRequest = async (user: UserType): Promise<void> => {
    if (auth.currentUser?.uid) {
      await updateDoc(doc(db, 'Users', user.uid), {
        friends: arrayUnion(auth.currentUser?.uid)
      })

      await updateDoc(doc(db, 'Users', auth.currentUser.uid), {
        friends: arrayUnion(user.uid),
        requests: arrayRemove(user.uid)
      })
    }
  }

  const declineFriendRequest = async (user: UserType): Promise<void> => {
    if (auth.currentUser?.uid) {
      await updateDoc(doc(db, 'Users', auth.currentUser.uid), {
        requests: arrayRemove(user.uid)
      })
    }
  }
  const sendMessage = async (message: string): Promise<void> => {
    if (auth.currentUser && authStore.user && currentFriend.value) {
      const combiID: string =
        auth.currentUser.uid > currentFriend.value?.uid
          ? auth.currentUser.uid + currentFriend.value.uid
          : currentFriend.value.uid + auth.currentUser.uid

      const chat = await getDoc(doc(db, 'chats', combiID))
      if (chat.exists()) {
        const messages: ChatType[] = chat.data().messages || []
        const withNew: ChatType[] = [
          ...messages,
          {
            text: message,
            sender: authStore.user,
            timestamp: Timestamp.fromDate(new Date())
          }
        ]
        await setDoc(doc(db, 'chats', combiID), {
          messages: withNew
        })
      } else {
        await setDoc(doc(db, 'chats', combiID), {
          messages: [
            {
              text: message,
              sender: authStore.user,
              timestamp: Timestamp.fromDate(new Date())
            }
          ]
        })
      }
    }
  }
  const unFriend = async (): Promise<void> => {
    if (auth.currentUser && authStore.user && currentFriend.value) {
      const combiID: string =
        auth.currentUser.uid > currentFriend.value?.uid
          ? auth.currentUser.uid + currentFriend.value.uid
          : currentFriend.value.uid + auth.currentUser.uid

      await deleteDoc(doc(db, 'chats', combiID))

      await updateDoc(doc(db, 'Users', currentFriend.value.uid), {
        friends: arrayRemove(auth.currentUser?.uid)
      })
        .then(async (): Promise<void> => {
          if (auth.currentUser && currentFriend.value) {
            await updateDoc(doc(db, 'Users', auth.currentUser.uid), {
              friends: arrayRemove(currentFriend.value.uid)
            })
          }
        })
        .then(() => {
          currentFriend.value = friends.value[0]
          getChat()
        })
    }
  }

  const unwatch = watch(
    () => authStore.user,
    () => {
      getPending()
      getFriends()
    }
  )
  const unwatchFriends = watch(
    () => authStore.allUsers,
    () => {
      getFriends()
    }
  )
  const unwatchRemovedFriend = watch(friends, (newfriends: UserType[]) => {
    if (currentFriend.value) {
      const isFriendRemoved = !newfriends.some((friend) => friend.uid === currentFriend.value?.uid)

      if (isFriendRemoved) {
        currentFriend.value = newfriends[0]
        getChat()
      }
    }
  })
  onUnmounted(() => {
    unwatch()
    unwatchFriends()
    unwatchRemovedFriend()
  })

  return {
    friendPopUp,
    TogglePopUp,
    sendFriendRequest,
    pending,
    confirmFriendRequest,
    declineFriendRequest,
    friends,
    getFriends,
    getPending,
    currentFriend,
    sendMessage,
    getChat,
    chat,
    unFriend
  }
})
