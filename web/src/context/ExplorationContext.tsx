import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { db } from '../lib/firebase'

const STORAGE_KEY = 'paridhi.exploredProjects'

interface ExplorationContextValue {
  exploredProjectIds: string[]
  isExplored: (projectId: string) => boolean
  markExplored: (projectId: string) => void
  totalExplored: number
}

const ExplorationContext = createContext<ExplorationContextValue | undefined>(undefined)

function loadExploredIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

export function ExplorationProvider({ children }: { children: React.ReactNode }) {
  const { user, isConfigured } = useAuth()
  const [exploredProjectIds, setExploredProjectIds] = useState<string[]>(() => loadExploredIds())
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exploredProjectIds))
  }, [exploredProjectIds])

  useEffect(() => {
    async function hydrateFromCloud() {
      if (!db || !user || !isConfigured) {
        setHydratedUserId(null)
        return
      }

      const userRef = doc(db, 'users', user.uid)
      const snapshot = await getDoc(userRef)
      const cloudIds = Array.isArray(snapshot.data()?.exploredProjectIds)
        ? snapshot.data()?.exploredProjectIds.filter((item: unknown): item is string => typeof item === 'string')
        : []

      setExploredProjectIds((previous) => Array.from(new Set([...previous, ...cloudIds])))
      setHydratedUserId(user.uid)
    }

    void hydrateFromCloud()
  }, [isConfigured, user])

  useEffect(() => {
    async function persistExploration() {
      if (!db || !user || !isConfigured || hydratedUserId !== user.uid) return

      await setDoc(
        doc(db, 'users', user.uid),
        {
          exploredProjectIds,
          exploredCount: exploredProjectIds.length,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    }

    void persistExploration()
  }, [exploredProjectIds, hydratedUserId, isConfigured, user])

  const value = useMemo<ExplorationContextValue>(
    () => ({
      exploredProjectIds,
      totalExplored: exploredProjectIds.length,
      isExplored: (projectId) => exploredProjectIds.includes(projectId),
      markExplored: (projectId) => {
        setExploredProjectIds((previous) => {
          if (previous.includes(projectId)) return previous
          return [...previous, projectId]
        })
      },
    }),
    [exploredProjectIds],
  )

  return <ExplorationContext.Provider value={value}>{children}</ExplorationContext.Provider>
}

export function useExploration() {
  const context = useContext(ExplorationContext)
  if (!context) {
    throw new Error('useExploration must be used within ExplorationProvider')
  }

  return context
}
