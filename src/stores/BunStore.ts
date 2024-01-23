import {defineStore} from 'pinia'
import {getAuth} from 'firebase/auth'
import {useFriendStore} from '@/stores/FriendStore'
import type {Auth} from 'firebase/auth'
import type {Ref} from 'vue'
import {ref} from 'vue'
import {deleteField, doc, updateDoc} from 'firebase/firestore'
import {db} from '@/firebase-service'
import {useAuthStore} from '@/stores/AuthStore'
import type {ChatType, UserType} from '@/interfaces'

export const useBunStore = defineStore('bun-communication', () => {
    // const socket: WebSocket = new WebSocket('ws://localhost:3000')
    const socket: WebSocket = new WebSocket('ws://buntest-odisee.koyeb.app/3000')
    const auth: Auth = getAuth()
    const friendStore = useFriendStore()
    const authStore = useAuthStore()
    const combiId: Ref<string> = ref('')
    const dataChannel: Ref<RTCDataChannel | undefined> = ref()
    const messages: Ref<[ChatType?]> = ref([])

    const CallPeer = async (): Promise<void> => {
        if (auth.currentUser && friendStore.currentFriend) {
            await getCombiId()

            await updateDoc(doc(db, 'Users', auth.currentUser.uid), {
                calls: {
                    id: friendStore.currentFriend.uid,
                    status: 'pending',
                    caller: 'me'
                }
            })
            await updateDoc(doc(db, 'Users', friendStore.currentFriend.uid), {
                calls: {
                    id: auth.currentUser.uid,
                    status: 'pending',
                    caller: 'notMe'
                }
            })

            const data = {
                id: combiId.value,
                type: 'join'
            }

            socket.send(JSON.stringify(data))
        }
    }

    const DeclineCall = async (callerId: string): Promise<void> => {
        if (auth.currentUser && friendStore.currentFriend) {
            await updateDoc(doc(db, 'Users', auth.currentUser.uid), {
                calls: deleteField()
            })
            await updateDoc(doc(db, 'Users', callerId), {
                calls: deleteField()
            })
        }
    }

    const AcceptCall = async (callerId: string): Promise<void> => {
        if (auth.currentUser) {
            if (friendStore.currentFriend?.uid !== callerId) {
                friendStore.currentFriend = authStore.allUsers.find(
                    (user) => user.uid === authStore.user?.calls.id
                ) as UserType

                friendStore.getChat()

                await getCombiId()
            }
            const join = {
                id: combiId.value,
                type: 'accepted'
            }

            socket.send(JSON.stringify(join))

            await updateDoc(doc(db, 'Users', auth.currentUser.uid), {
                calls: {
                    id: callerId,
                    status: 'accepted',
                    caller: 'notMe'
                }
            })
            await updateDoc(doc(db, 'Users', callerId), {
                calls: {
                    id: auth.currentUser.uid,
                    status: 'accepted',
                    caller: 'me'
                }
            })
        }
    }

    const getCombiId = async (): Promise<void> => {
        if (friendStore.currentFriend && auth.currentUser) {
            combiId.value =
                auth.currentUser.uid > friendStore.currentFriend.uid
                    ? auth.currentUser.uid + friendStore.currentFriend.uid
                    : friendStore.currentFriend.uid + auth.currentUser.uid
        }
    }

    return {
        CallPeer,
        DeclineCall,
        AcceptCall,
        socket,
        combiId,
        dataChannel,
        messages
    }
})
