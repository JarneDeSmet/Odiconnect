import type {Timestamp} from 'firebase/firestore'

export interface UserType {
    uid: string
    email: string
    username: string
    status: string
    img: string
    requests: string[]
    friends: string[]
    calls: CallType
}

export interface SenderType {
    uid: string
    email: string
    username: string
}

export interface ChatType {
    text: string
    sender: SenderType
    timestamp: string | Timestamp
}

export interface CallType {
    id: string
    status: string
    caller: string
}

export interface JointsType {
    thumb: Array<number>,
    indexFinger: Array<number>,
    middleFinger: Array<number>,
    ringFinger: Array<number>,
    pinky: Array<number>,
}

export interface prediction {
    name: string,
    score: number
}