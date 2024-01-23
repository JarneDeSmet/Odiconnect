import {defineStore} from 'pinia'
import * as handpose from "@tensorflow-models/handpose";
import type {Ref} from "vue";
import {ref} from "vue";
import '@tensorflow/tfjs-backend-webgl';


export const useTensorflowStore = defineStore('tensor', () => {
    const net: Ref<undefined | handpose.HandPose> = ref()
    const emoji: Ref = ref()
    const loadModel = async (): Promise<void> => {
        net.value = await handpose.load()
        console.log('handpose model loaded')

    }


    return {
        net,
        loadModel,
        emoji
    }
})
