import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

console.log('🔍 Firebase Config Status:', {
  isConfigured: isFirebaseConfigured,
  projectId: firebaseConfig.projectId,
  useEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS,
})

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

// Configure Auth Persistence (Keep users logged in after page refresh)
if (auth) {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('✅ Auth persistence enabled - Users will stay logged in')
    })
    .catch((error) => {
      console.error('❌ Failed to enable persistence:', error)
    })
}

console.log('🔍 Firebase Initialization:', {
  appInitialized: !!app,
  authInitialized: !!auth,
  dbInitialized: !!db,
})
export const firebaseFunctions = app
  ? getFunctions(app, import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'asia-south1')
  : null

const provider = new GoogleAuthProvider()

if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  console.log('🚀 Connecting to Firebase Emulators...')
  try {
    if (firebaseFunctions) connectFunctionsEmulator(firebaseFunctions, '127.0.0.1', 5001)
    if (db) connectFirestoreEmulator(db, '127.0.0.1', 8080)
    if (auth) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    console.log('✅ Connected to Firebase Emulators Successfully')
  } catch (error) {
    console.error('❌ Failed to connect to emulators:', error)
  }
} else {
  console.log('ℹ️ Using Firebase Production or No Emulators configured:', {
    isDev: import.meta.env.DEV,
    useEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS,
  })
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase auth is not configured.')
  return signInWithPopup(auth, provider)
}

export async function signOutUser() {
  if (!auth) throw new Error('Firebase auth is not configured.')
  return signOut(auth)
}

// Emulator testing: Email/Password authentication
export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase auth is not configured.')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase auth is not configured.')
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function requestPushToken() {
  if (!app) throw new Error('Firebase app is not configured.')

  const supported = await isSupported()
  if (!supported) return null

  const messaging = getMessaging(app)
  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: await navigator.serviceWorker.getRegistration(),
  })
}