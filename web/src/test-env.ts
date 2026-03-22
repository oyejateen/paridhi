// This file just logs environment variables to help debug
console.log('📋 Environment Variables Debug:')
console.log({
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
  VITE_USE_FIREBASE_EMULATORS: import.meta.env.VITE_USE_FIREBASE_EMULATORS,
  VITE_FIRESTORE_EMULATOR_HOST: import.meta.env.VITE_FIRESTORE_EMULATOR_HOST,
  DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
})
