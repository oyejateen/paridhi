import type { Timestamp } from 'firebase/firestore'

export type PostStatus = 'active' | 'limited' | 'hidden'

export interface CommunityPost {
  id: string
  authorId: string
  authorName: string
  authorPhotoURL: string | null
  content: string
  upvotes: number
  downvotes: number
  reports: number
  score: number
  status: PostStatus
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  projectId?: string // Link to a project
  imageURL?: string // Allow image attachments
}
