import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import type { User } from 'firebase/auth'
import { db, firebaseFunctions } from '../firebase'
import type { CommunityPost, PostStatus } from '../../types/community'

const moderationPriority: Record<PostStatus, number> = {
  active: 0,
  limited: 1,
  hidden: 2,
}

function ensureDb() {
  if (!db) {
    throw new Error('Firebase is not configured yet. Add your VITE_FIREBASE_* keys.')
  }

  return db
}

function ensureFunctions() {
  if (!firebaseFunctions) {
    throw new Error('Cloud Functions is not configured yet.')
  }

  return firebaseFunctions
}

export async function createCommunityPost(content: string, user: User) {
  const firestore = ensureDb()
  const cleanContent = content.trim()

  if (cleanContent.length < 4) {
    throw new Error('Post is too short.')
  }

  await addDoc(collection(firestore, 'posts'), {
    authorId: user.uid,
    authorName: user.displayName ?? 'Explorer',
    authorPhotoURL: user.photoURL ?? null,
    content: cleanContent,
    status: 'active',
    upvotes: 0,
    downvotes: 0,
    reports: 0,
    score: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function voteOnCommunityPost(postId: string, vote: 'up' | 'down' | 'none') {
  const instance = ensureFunctions()
  const votePost = httpsCallable(instance, 'votePost')
  await votePost({ postId, vote })
}

export async function reportCommunityPost(postId: string, reason: string) {
  const instance = ensureFunctions()
  const reportPost = httpsCallable(instance, 'reportPost')
  await reportPost({ postId, reason })
}

export function subscribeToCommunityPosts(
  callback: (posts: CommunityPost[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const firestore = ensureDb()
  const postsQuery = query(
    collection(firestore, 'posts'),
    where('status', 'in', ['active', 'limited']),
    orderBy('score', 'desc'),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    postsQuery,
    (snapshot) => {
      const posts: CommunityPost[] = snapshot.docs.map((doc) => {
        const raw = doc.data() as Omit<CommunityPost, 'id'>
        return {
          id: doc.id,
          ...raw,
          authorPhotoURL: raw.authorPhotoURL ?? null,
          status: raw.status ?? 'active',
          upvotes: Number(raw.upvotes ?? 0),
          downvotes: Number(raw.downvotes ?? 0),
          reports: Number(raw.reports ?? 0),
          score: Number(raw.score ?? 0),
          createdAt: raw.createdAt ?? null,
          updatedAt: raw.updatedAt ?? null,
        }
      })

      posts.sort((a, b) => {
        const statusDelta = moderationPriority[a.status] - moderationPriority[b.status]
        if (statusDelta !== 0) return statusDelta
        if (a.score !== b.score) return b.score - a.score
        const aTime = a.createdAt?.toMillis() ?? 0
        const bTime = b.createdAt?.toMillis() ?? 0
        return bTime - aTime
      })

      callback(posts)
    },
    (error) => onError(error),
  )
}
