import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, db, isFirebaseConfigured, signInWithGoogle, signOutUser } from '../lib/firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isConfigured: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    async function upsertUserProfile(nextUser: User) {
      if (!db) return

      const userRef = doc(db, 'users', nextUser.uid)
      await setDoc(
        userRef,
        {
          uid: nextUser.uid,
          displayName: nextUser.displayName ?? 'Explorer',
          email: nextUser.email ?? null,
          photoURL: nextUser.photoURL ?? null,
          lastSeenAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    if (!user || !isFirebaseConfigured) return
    void upsertUserProfile(user)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      signIn: async () => {
        await signInWithGoogle()
      },
      signOut: async () => {
        await signOutUser()
      },
    }),
    [loading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
