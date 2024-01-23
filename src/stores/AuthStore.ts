import {defineStore} from 'pinia'
import router from '@/router'
import type {Ref} from 'vue'
import {onUnmounted, ref, watch} from 'vue'
import type {Auth, Unsubscribe} from 'firebase/auth'
import {getAuth, signOut} from 'firebase/auth'
import {collection, doc, onSnapshot, updateDoc} from 'firebase/firestore'
import {db} from '@/firebase-service'
import type {UserType} from '@/interfaces'

export const useAuthStore = defineStore('auth', () => {
    const auth: Auth = getAuth()
    const user: Ref<UserType | null> = ref(null)
    const allUsers: Ref<UserType[]> = ref([])
    let unsubscribeUser: Unsubscribe | null = null
    const accountPopup: Ref<boolean> = ref(false)

    const getUser = (): void => {
        if (getAuth().currentUser) {
            if (unsubscribeUser) {
                unsubscribeUser()
            }
            unsubscribeUser = onSnapshot(
                doc(collection(db, 'Users'), getAuth().currentUser?.uid),
                (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        user.value = docSnapshot.data() as UserType
                    } else {
                        console.error(`User with ID ${getAuth().currentUser?.uid} does not exist.`)
                    }
                }
            )
        }
    }

    const unsubscribeUsers: Unsubscribe = onSnapshot(collection(db, 'Users'), (snapshot) => {
        allUsers.value = snapshot.docs.map((doc) => ({...doc.data()})) as UserType[]
    })
    const handleSignOut = (): void => {
        signOut(getAuth()).then((): void => {
            router.push('/login')
        })
    }
    const handleStatus = async (status: string): Promise<void> => {
        if (auth.currentUser?.uid) {
            await updateDoc(doc(db, 'Users', auth.currentUser.uid), {
                status: status
            })
        }
    }
    const toggleAccount = (): void => {
        accountPopup.value = !accountPopup.value
    }

    const unwatch = watch(
        () => getAuth().currentUser,
        () => {
            getUser()
        }
    )

    getUser()
    onUnmounted((): void => {
        unsubscribeUsers()
        unwatch()
    })

    return {
        user,
        allUsers,
        handleSignOut,
        getUser,
        handleStatus,
        accountPopup,
        toggleAccount
    }
})
