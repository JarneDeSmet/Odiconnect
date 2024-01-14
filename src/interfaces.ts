import type { Timestamp } from 'firebase/firestore'

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

export interface ChatType {
  text: string
  sender: UserType
  timestamp: Timestamp
}

export interface CallType {
  id: string
  status: string
  caller: string
}
