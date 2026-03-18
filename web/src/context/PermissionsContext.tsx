import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { db } from '../lib/firebase'

const STORAGE_KEY = 'paridhi.permissions'

type PermissionState = {
  location: boolean
  notifications: boolean
}

interface PermissionsContextValue {
  locationAllowed: boolean
  notificationsAllowed: boolean
  allExplorePermissionsGranted: boolean
  setLocationAllowed: (value: boolean) => void
  setNotificationsAllowed: (value: boolean) => void
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined)

function loadInitialPermissions(): PermissionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { location: false, notifications: false }
    const parsed = JSON.parse(raw) as PermissionState
    return {
      location: Boolean(parsed.location),
      notifications: Boolean(parsed.notifications),
    }
  } catch {
    return { location: false, notifications: false }
  }
}

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user, isConfigured } = useAuth()
  const [permissions, setPermissions] = useState<PermissionState>(() => loadInitialPermissions())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions))
  }, [permissions])

  useEffect(() => {
    async function persistPermissions() {
      if (!db || !user || !isConfigured) return

      await setDoc(
        doc(db, 'users', user.uid),
        {
          permissions,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    void persistPermissions()
  }, [isConfigured, permissions, user])

  const value = useMemo<PermissionsContextValue>(
    () => ({
      locationAllowed: permissions.location,
      notificationsAllowed: permissions.notifications,
      allExplorePermissionsGranted: permissions.location && permissions.notifications,
      setLocationAllowed: (value) =>
        setPermissions((previous) => ({
          ...previous,
          location: value,
        })),
      setNotificationsAllowed: (value) =>
        setPermissions((previous) => ({
          ...previous,
          notifications: value,
        })),
    }),
    [permissions],
  )

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within PermissionsProvider')
  }

  return context
}
