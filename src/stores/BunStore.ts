import { defineStore } from 'pinia'
import { getAuth } from 'firebase/auth'
import { useFriendStore } from '@/stores/FriendStore'
import type { Auth } from 'firebase/auth'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { deleteField, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase-service'
import { useAuthStore } from '@/stores/AuthStore'
import type { UserType } from '@/interfaces'

export const useBunStore = defineStore('bun-communication', () => {
  // const socket: WebSocket = new WebSocket('ws://localhost:3000')
  const socket = new WebSocket('ws://buntest-odisee.koyeb.app/3000')
  const auth: Auth = getAuth()
  const friendStore = useFriendStore()
  const authStore = useAuthStore()
  const combiId: Ref<string> = ref('')

  const peerConnection: Ref<RTCPeerConnection | undefined> = ref()
  const localStream: Ref<MediaStream> = ref(new MediaStream())

  const remoteStream: Ref<MediaStream> = ref(new MediaStream())
  const servers = {
    iceServers: [
      {
        urls: ['stun:stun.l.google.com:19302', 'stun:stun2.l.google.com:19302']
      }
    ]
  }
  const constraints = {
    video: {
      width: { min: 1280, ideal: 1920, max: 1920 },
      height: { min: 720, ideal: 1080, max: 1080 },
      facingMode: 'user'
    },
    audio: true
  }

  socket.addEventListener('open', async () => {
    console.log('connection opened')
  })
  socket.addEventListener('message', async (event) => {
    const message = JSON.parse(event.data)
    if (message.type === 'MessageFromPeer') {
      if (message.messageType === 'do-offer') {
        await createOffer()
      }
      if (message.messageType === 'offer') {
        await createAnswer(message.offer)
      }
      if (message.messageType === 'answer') {
        await addAnswer(message.answer)
      }
      if (message.messageType === 'candidate') {
        if (peerConnection.value) {
          try {
            await peerConnection.value?.addIceCandidate(message.candidate)
            console.log('ICE candidate added successfully.')
            console.log(peerConnection.value.iceConnectionState)
          } catch (error) {
            console.error('Error adding ICE candidate:', error)
          }
        }
      }
    }
  })

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

        //combiID
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
          caller: 'notMe'
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
  const createOffer = async (): Promise<void> => {
    await createPeerConnection()
    const offer: RTCSessionDescriptionInit | undefined = await peerConnection.value?.createOffer()
    await peerConnection.value?.setLocalDescription(offer)

    const data = {
      id: combiId.value,
      type: 'offer',
      offer: offer
    }

    socket.send(JSON.stringify(data))
  }

  const createAnswer = async (offer): Promise<void> => {
    console.log('offer gekregen', offer)
    await createPeerConnection()

    const newOffer = new RTCSessionDescription(offer)

    await peerConnection.value?.setRemoteDescription(newOffer).catch((error) => {
      console.error('Error setting remote description:', error)
    })

    const answer = await peerConnection.value?.createAnswer()
    await peerConnection.value?.setLocalDescription(answer)

    console.log(peerConnection.value)

    const data = {
      id: combiId.value,
      type: 'answer',
      answer: answer
    }
    socket.send(JSON.stringify(data))
  }

  const addAnswer = async (answer): Promise<void> => {
    console.log('answer gekregen', answer)
    if (!peerConnection.value?.currentRemoteDescription) {
      console.log('answer toevoegen')
      const newAnswer = new RTCSessionDescription(answer)
      await peerConnection.value?.setRemoteDescription(newAnswer)
      console.log(peerConnection.value)
    }
  }

  const createPeerConnection = async (): Promise<void> => {
    peerConnection.value = new RTCPeerConnection(servers)

    if (!localStream.value) {
      localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
    }

    localStream.value.getTracks().forEach((track) => {
      peerConnection.value!.addTrack(track, localStream.value)
    })

    peerConnection.value!.ontrack = (event: RTCTrackEvent): void => {
      event.streams[0].getTracks().forEach((track: MediaStreamTrack): void => {
        remoteStream.value.addTrack(track)
      })
    }
    peerConnection.value!.onicecandidate = async (event): Promise<void> => {
      console.log('candidate', event.candidate)
      if (event.candidate) {
        const data = {
          id: combiId.value,
          type: 'candidate',
          candidate: event.candidate
        }
        socket.send(JSON.stringify(data))
      }
    }
  }

  const toggleCamera = async (): Promise<void> => {
    const videoTrack = localStream.value.getTracks().find((track) => track.kind === 'video')
    videoTrack!.enabled = !videoTrack!.enabled
  }
  const toggleMic = async (): Promise<void> => {
    const audioTrack = localStream.value.getTracks().find((track) => track.kind === 'audio')
    audioTrack!.enabled = !audioTrack!.enabled
  }
  return {
    CallPeer,
    DeclineCall,
    AcceptCall,
    remoteStream,
    localStream,
    constraints,
    toggleMic,
    toggleCamera
  }
})
