<script setup lang="ts">
import DashboardHeader from '@/components/molecules/DashboardHeader.vue'
import CallSidebar from '@/components/organisms/CallSidebar.vue'
import {useBunStore} from '@/stores/BunStore'
import {onMounted, onUnmounted, ref, watch} from 'vue'
import type {Ref} from 'vue'
import {useAuthStore} from "@/stores/AuthStore";
import router from "@/router";
import {useFriendStore} from "@/stores/FriendStore";
import type {ChatType, prediction} from "@/interfaces";
import '@tensorflow/tfjs-backend-webgl';
import * as handpose from "@tensorflow-models/handpose"
import * as fp from "fingerpose"
import {drawHand} from "@/composables/utilities";
import type {AnnotatedPrediction} from "@tensorflow-models/handpose";
import {loveYouGesture} from "@/composables/CustomPoses";
import {useTensorflowStore} from "@/stores/TensorflowStore";

const bunStore = useBunStore()
const authStore = useAuthStore()
bunStore.socket.addEventListener('open', async () => {
  console.log('connection opened')
})
const me: Ref = ref()
const peer: Ref = ref()
let localStream: MediaStream
let remoteStream: MediaStream
let peerConnection: RTCPeerConnection

const canvasRef: Ref<HTMLCanvasElement | undefined> = ref()
const tensorFlowStore = useTensorflowStore()
const servers = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:stun2.l.google.com:19302']
    }
  ],
  iceCandidatePoolSize: 10
}
const constraints = {
  video: {
    width: {min: 1280, ideal: 1920, max: 1920},
    height: {min: 720, ideal: 1080, max: 1080},
    facingMode: 'user'
  },
  audio: true
}

onMounted(async (): Promise<void> => {
  if (authStore.user?.calls.caller === 'notMe') {
    await createOffer()
  }
  localStream = await navigator.mediaDevices.getUserMedia(constraints)
  me.value.srcObject = localStream

  bunStore.socket.addEventListener('message', async (event) => {
    const message = JSON.parse(event.data)
    if (message.type === 'MessageFromPeer') {
      // if (message.messageType === 'do-offer') {
      //   await createOffer()
      // }
      if (message.messageType === 'offer') {
        await createAnswer(message.offer)
      }
      if (message.messageType === 'answer') {
        await addAnswer(message.answer)
      }
      if (message.messageType === 'candidate') {
        if (peerConnection) {
          try {
            await peerConnection.addIceCandidate(message.candidate)
            console.log('ICE candidate added successfully.')
            console.log(peerConnection.iceConnectionState)
          } catch (error) {
            console.error('Error adding ICE candidate:', error)
          }
        }
      }
    }
  })


})


const createOffer = async (): Promise<void> => {
  await createPeerConnection()
  const offer: RTCSessionDescriptionInit | undefined = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)

  const data = {
    id: bunStore.combiId,
    type: 'offer',
    offer: offer
  }

  bunStore.socket.send(JSON.stringify(data))
}

const createAnswer = async (offer: RTCSessionDescriptionInit): Promise<void> => {
  console.log('offer gekregen', offer)
  await createPeerConnection()

  const newOffer = new RTCSessionDescription(offer)

  await peerConnection.setRemoteDescription(newOffer).catch((error) => {
    console.error('Error setting remote description:', error)
  })

  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  console.log(peerConnection)

  const data = {
    id: bunStore.combiId,
    type: 'answer',
    answer: answer
  }
  bunStore.socket.send(JSON.stringify(data))
}

const addAnswer = async (answer: RTCSessionDescriptionInit): Promise<void> => {
  console.log('answer gekregen', answer)
  if (!peerConnection.currentRemoteDescription) {
    console.log('answer toevoegen')
    const newAnswer = new RTCSessionDescription(answer)
    await peerConnection.setRemoteDescription(newAnswer)
    console.log(peerConnection)
  }
}

const createPeerConnection = async (): Promise<void> => {
  peerConnection = new RTCPeerConnection(servers)

  remoteStream = new MediaStream()
  peer.value.srcObject = remoteStream

  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia(constraints)
  }

  localStream.getTracks().forEach((track: MediaStreamTrack) => {
    peerConnection.addTrack(track, localStream)
  })

  peerConnection.ontrack = (event: RTCTrackEvent): void => {
    event.streams[0].getTracks().forEach((track: MediaStreamTrack): void => {
      remoteStream.addTrack(track)
    })
  }
  peerConnection.onicecandidate = (event): void => {
    console.log('candidate', event.candidate)
    if (event.candidate) {
      const data = {
        id: bunStore.combiId,
        type: 'candidate',
        candidate: event.candidate
      }
      bunStore.socket.send(JSON.stringify(data))
    }
  }

  peerConnection.onconnectionstatechange = () => {
    if (peerConnection.connectionState === 'connected') {
      runHandpose()
    }

  };

  bunStore.dataChannel = createDataChannel()


  peerConnection.ondatachannel = (event) => {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      displayMessage(receivedData);
    };
  };
}
const cameraOn: Ref<boolean> = ref(true)
const audioOn: Ref<boolean> = ref(true)
const toggleCamera = async (): Promise<void> => {
  const videoTrack = localStream.getTracks().find((track) => track.kind === 'video')
  videoTrack!.enabled = !videoTrack!.enabled
  cameraOn.value = !cameraOn.value
}
const toggleAudio = async (): Promise<void> => {
  const audioTrack = localStream.getTracks().find((track) => track.kind === 'audio')
  audioTrack!.enabled = !audioTrack!.enabled
  audioOn.value = !audioOn.value
}
const isScreenSharing: Ref<boolean> = ref(false)
const screenConstraints = {
  video: {
    cursor: "always"
  },
  audio: true
};
const toggleStream = async (): Promise<void> => {
  if (isScreenSharing.value) {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    me.value.srcObject = localStream;
    isScreenSharing.value = false;
  } else {

    try {
      localStream = await navigator.mediaDevices.getDisplayMedia(screenConstraints as DisplayMediaStreamOptions);
      me.value.srcObject = localStream;
      isScreenSharing.value = true;
    } catch (error) {
      console.error("Error accessing screen:", error);
    }
  }

  if (peerConnection) {
    peerConnection.getSenders().forEach((sender): void => {
      if (sender.track) {
        if (sender.track.kind === 'video') {
          sender.replaceTrack(localStream.getVideoTracks()[0]);
        }
      }
    });
  }
};
const createDataChannel = (): RTCDataChannel => {
  const dataChannel = peerConnection.createDataChannel(bunStore.combiId);

  dataChannel.onopen = () => {
    console.log('Data channel opened!');
  };

  dataChannel.onmessage = (event) => {
    const receivedData = JSON.parse(event.data);
    displayMessage(receivedData);
  };

  return dataChannel;
};


const displayMessage = (data: ChatType): void => {
  bunStore.messages.push(data)
}
const leaveCall = async (): Promise<void> => {
  const friendStore = useFriendStore()
  await bunStore.DeclineCall(friendStore.currentFriend!.uid)
  peerConnection.close()

  const data = {
    id: bunStore.combiId,
    type: 'leave',
  }
  bunStore.socket.send(JSON.stringify(data))
  await router.push('dashboard')
}

const unwatch = watch(
    () => authStore.user,
    () => {
      if (!authStore.user?.calls) {
        peerConnection.close()
        const data = {
          id: bunStore.combiId,
          type: 'leave',
        }
        bunStore.socket.send(JSON.stringify(data))
        router.push({name: 'dashboard'})
      }
    }
)

const runHandpose = async (): Promise<void> => {
  const net: handpose.HandPose = await handpose.load()

  setInterval(() => {
    detect(net)
  }, 100)

}

const detect = async (net: handpose.HandPose): Promise<void> => {

  if (typeof me.value !== "undefined" &&
      me.value !== null &&
      me.value.readyState === 4) {

    const video: HTMLVideoElement = me.value
    const videoWidth: number = me.value.videoWidth
    const videoHeight: number = me.value.videoHeight


    me.value.width = videoWidth
    me.value.height = videoHeight

    canvasRef.value!.width = videoWidth
    canvasRef.value!.height = videoHeight

    const hand: Array<AnnotatedPrediction> = await net.estimateHands(video)

    if (hand.length > 0) {
      const GE: fp.GestureEstimator = new fp.GestureEstimator([
        fp.Gestures.VictoryGesture,
        fp.Gestures.ThumbsUpGesture,
        loveYouGesture
      ]);

      const gesture = await GE.estimate(hand[0].landmarks, 8)

      if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
        const confidence: Array<number> = gesture.gestures.map((prediction: prediction) => prediction.score)

        const maxConfindence: number = confidence.indexOf(Math.max.apply(null, confidence))
        tensorFlowStore.emoji = gesture.gestures[maxConfindence].name
        console.log(tensorFlowStore.emoji)
      }

    }


    const ctx: CanvasRenderingContext2D | null = canvasRef.value!.getContext("2d")

    drawHand(hand, ctx!)
  }


}

onUnmounted(() => {
  unwatch()
})
</script>

<template>
  <DashboardHeader/>
  <main>
    <div class="call">
      <div class="video">
        <div class="tensor">
          <video ref="me" autoplay playsinline id="me" muted></video>
          <canvas ref="canvasRef"/>
        </div>
        <video ref="peer" autoplay playsinline id="peer"></video>
      </div>

      <div class="buttons">
        <div @click="toggleStream" v-if="isScreenSharing" class="btn sharing">
          <img src="@/assets/images/screen-share-off.png" alt="screen icon with arrow">
        </div>
        <div @click="toggleStream" v-else class="btn">
          <img src="@/assets/images/screen-share.png" alt="screen icon with arrow">
        </div>

        <div @click="toggleCamera" class="btn" :class="cameraOn? '':'off'">
          <img
              src="@/assets/images/video.png"
              alt="camera icon ">
        </div>
        <div @click="toggleAudio" class="btn" :class="audioOn? '':'off'">
          <img src="@/assets/images/microphone.png" alt="microphone icon">

        </div>
        <div @click="leaveCall" class="btn hangup">
          <img src="@/assets/images/hangup.png" alt="phone with x next to it">

        </div>
        <!--        <span @click="bunStore.toggleMic()">mute</span>-->
        <!--        <span @click="bunStore.toggleCamera()">camera</span>-->

      </div>
    </div>
    <call-sidebar/>
  </main>
</template>

<style scoped lang="scss">
main {
  display: flex;
  height: calc(100vh - 3.5rem);
  flex-grow: 1;

  .video {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    min-height: 98vh;

    video {
      width: 27rem;
      height: 19rem;
      margin-right: 1rem;
    }

    .tensor {
      width: 27rem;
      height: 19rem;
      position: relative;

      video {
        position: absolute;
      }

      canvas {
        position: absolute;
        width: 27rem;
        height: 19rem;
      }
    }
  }


  .call {
    flex-grow: 1;
    position: relative;

    .buttons {
      position: absolute;
      bottom: 1.5rem;
      display: flex;
      width: calc(100% - 2rem);
      justify-content: center;
      gap: 1rem;

      span {
        text-align: center;
        width: 1rem;
        aspect-ratio: 1/1;
        background-color: red;
      }
    }
  }
}

.btn {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-dark);
  transition-duration: 0.3s;
  position: relative;

  img {
    width: 2rem;
    aspect-ratio: 1/1;
  }

  &:hover {
    background-color: var(--accent);
    cursor: pointer;

    transition-duration: 0.3s;
  }
}

.sharing {
  background-color: #171717;

}

.off {
  background-color: #171717;
  position: relative;
}

.off:before {
  content: '';
  position: absolute;

  width: 70%;
  height: 0.1rem;
  transform: rotate(-50deg);
  background-color: white;
  z-index: 2;
}

.off:after {
  content: '';
  position: absolute;

  width: 70%;
  height: 0.5rem;
  transform: rotate(-50deg);
  background-color: inherit;
  z-index: 1;
}

.hangup {
  background-color: var(--red);

  &:hover {
    background-color: #cc0404;

  }
}

@media (min-width: 60.063rem) {
  main {
    .video {
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
    }
  }


}


</style>
