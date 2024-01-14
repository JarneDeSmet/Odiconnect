import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore'

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyAT_lO4FKa24L52keDvFUsS1-CpUoJqI7o',
  authDomain: 'web-topics-dc533.firebaseapp.com',
  projectId: 'web-topics-dc533',
  storageBucket: 'web-topics-dc533.appspot.com',
  messagingSenderId: '634619070046',
  appId: '1:634619070046:web:07f665b47aa16787aad6cf'
})

export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache(/*settings*/ { tabManager: persistentMultipleTabManager() })
})
