import { useEffect, useState } from 'react'
import { collection, query, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { MapPin, ChevronRight } from 'lucide-react'

interface Post {
  id: string
  title?: string
  content?: string
  projectId?: string
  category?: string
  status?: string
  location?: string
  progress?: number
  budget?: string
  upvotes?: number
  downvotes?: number
  score?: number
  createdAt?: any
}

export default function LiveUpdates() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      console.error('❌ Firestore (db) is not initialized - Check Firebase config')
      setLoading(false)
      return
    }

    console.log('🔄 Fetching posts from Firestore...')
    
    try {
      // Simple query: just get all posts (no where clause to avoid composite index requirement)
      const postsRef = collection(db, 'posts')
      const q = query(postsRef)  // No filters needed
      
      console.log('📥 Setting up Firestore listener...')

      // Real-time listener
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          console.log(`✅ Snapshot received: ${querySnapshot.size} documents total`)
          const postsData: Post[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            console.log(`  📄 Doc: ${doc.id}`, { status: data.status, hasContent: !!data.content })
            // Only show active posts on frontend
            if (data.status === 'active') {
              postsData.push({
                id: doc.id,
                ...data,
              } as Post)
            }
          })
          console.log(`✅ Got ${postsData.length} active posts`)
          // Sort by createdAt on frontend
          postsData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          setPosts(postsData)
          setLoading(false)
        },
        (error) => {
          console.error('❌ Error fetching posts:',error)
          console.error('Error code:', error.code)
          console.error('Error message:', error.message)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error('❌ Exception in LiveUpdates useEffect:', error)
      setLoading(false)
    }
  }, [])

  // Fallback dummy data if Firebase not connected
  const fallbackData: Post[] = [
    {
      id: '1',
      title: 'NH-44 Flyover Expansion',
      location: 'Delhi - NCR',
      status: 'New Tender',
      progress: 15,
      budget: '₹450 Cr',
      content: undefined,
      category: undefined,
      upvotes: 0,
      downvotes: 0,
      score: 0,
    },
  ]

  const displayPosts = posts.length > 0 ? posts : fallbackData

  return (
    <div className="px-6 space-y-4 mb-28">
      {loading && posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-stone-400 font-bold">Loading posts...</p>
        </div>
      ) : displayPosts.length > 0 ? (
        displayPosts.map((post) => (
          <div
            key={post.id}
            className="block bg-white p-5 rounded-[24px] border border-stone-100 shadow-sm active:scale-[0.97] transition-all cursor-pointer hover:shadow-md"
          >
            {/* Top Row */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 pr-3">
                <h4 className="text-[#451a03] text-[13px] font-black uppercase leading-tight line-clamp-2">
                  {post.title || post.content?.substring(0, 50) || 'Project Update'}
                </h4>
                <div className="flex items-center gap-1 mt-1 text-stone-400">
                  <MapPin size={10} />
                  <span className="text-[9px] font-bold uppercase tracking-wider truncate">
                    {post.location || post.category || 'Delhi'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
            </div>

            {/* Category Badge */}
            {post.category && (
              <div className="mb-2">
                <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
            )}

            {/* Vote Count */}
            <div className="flex justify-between items-center text-[10px] font-bold text-stone-400">
              <span>👍 {post.upvotes || 0} | 👎 {post.downvotes || 0}</span>
              <span>Score: {post.score || 0}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 bg-stone-50 rounded-2xl">
          <p className="text-xs text-stone-400 font-bold">No posts yet</p>
          <p className="text-[9px] text-stone-300 mt-1">Be the first to share an update!</p>
        </div>
      )}
    </div>
  )
}

