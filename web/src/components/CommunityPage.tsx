import { useEffect, useState } from 'react'
import { onSnapshot, collection, query } from 'firebase/firestore'
import { useNavigate } from "react-router-dom";
import { enhancedProjects } from '../data/projectsEnhanced'
import { 
  Plus, 
  Image as ImageIcon, 
  ArrowUpRight, 
  HardHat, 
  Construction, 
  Droplets,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

interface Post {
  id: string
  content?: string
  projectId?: string
  category?: string
  status?: string
  upvotes?: number
  downvotes?: number
  score?: number
  createdAt?: any
  authorName?: string
  authorId?: string
}

const CATEGORIES = ['All Posts', 'Roads', 'Smart City', 'Transport', 'Healthcare']

export default function CommunityPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedFilter, setSelectedFilter] = useState('All Posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    if (!db) {
      console.error('❌ Firestore not initialized')
      setLoading(false)
      return
    }

    console.log('🔄 Fetching posts from Firestore...')
    
    try {
      const postsRef = collection(db, 'posts')
      const q = query(postsRef)

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          console.log(`✅ Snapshot received: ${querySnapshot.size} TOTAL documents in collection`)
          const postsData: Post[] = []
          let activeCount = 0
          let inactiveCount = 0
          let statusUndefined = 0
          
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            console.log(`  📄 Document ${doc.id}:`, { 
              status: data.status || '(undefined)', 
              content: data.content?.substring(0, 40) || '(no content)',
              category: data.category
            })
            
            if (data.status === 'active') {
              activeCount++
              postsData.push({
                id: doc.id,
                ...data,
              } as Post)
            } else if (!data.status) {
              statusUndefined++
              console.warn(`  ⚠️ No status field on doc ${doc.id}`)
            } else {
              inactiveCount++
              console.warn(`  ⚠️ Inactive status: ${data.status}`)
            }
          })
          
          console.log(`📊 Final count: ${activeCount} active, ${inactiveCount} inactive, ${statusUndefined} no status`)
          if (querySnapshot.size === 0) {
            console.error('🔴 COLLECTION IS EMPTY! Check if emulator is running.')
          }
          
          // Sort by createdAt desc
          postsData.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
          setPosts(postsData)
          setLoading(false)
        },
        (error) => {
          console.error('❌ Error fetching posts:', error)
          console.error('Error code:', error.code)
          console.error('Error message:', error.message)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error('❌ Exception in CommunityPage:', error)
      setLoading(false)
    }
  }, [])

  // Filter posts by category
  const filteredPosts = selectedFilter === 'All Posts' 
    ? posts 
    : posts.filter(p => p.category === selectedFilter)

  const handleCreatePost = () => {
    if (!user) {
      navigate('/profile')
    } else {
      setShowCreatePost(true)
    }
  }
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* 1. Header: Community Branding */}
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-[#451a03] tracking-tighter uppercase leading-none">
          Communities
        </h1>
        <p className="text-[11px] font-bold text-orange-600 uppercase tracking-[0.3em]">
          Verified Citizen Reports
        </p>
      </header>

      {/* 2. Quick Filters: Project Type */}
      <section>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`whitespace-nowrap rounded-2xl px-6 py-2.5 text-xs font-black transition-all active:scale-90 ${
                selectedFilter === cat
                  ? 'bg-[#451a03] text-white shadow-xl shadow-orange-900/20' 
                  : 'bg-white text-[#451a03] border border-black/5 hover:bg-orange-50'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Create Post Button */}
      <div className="flex gap-3">
        <button
          onClick={handleCreatePost}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-xs font-black transition-all active:scale-95 shadow-lg shadow-orange-500/30"
        >
          <Plus size={16} strokeWidth={3} />
          Create Post
        </button>
      </div>

      {/* 4. Posts List */}
      {loading ? (
        <div className="text-center py-8 text-stone-400">
          <p>Loading posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-8 text-stone-400">
          <p>No posts in this category yet</p>
        </div>
      ) : (
        <section className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      )}

      {/* 5. Create Post Modal */}
      {showCreatePost && user && (
        <CreatePostModal 
          onClose={() => setShowCreatePost(false)}
          userId={user.uid}
          userName={user.displayName || 'Citizen'}
        />
      )}

      {/* 6. Infrastructure Community Hubs - Explore Projects */}
      <section className="space-y-4 pt-8">
        <h3 className="text-sm font-black text-[#451a03] uppercase tracking-widest opacity-40 px-1">
          Explore Projects
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <ProjectCard 
            title="Buildings" 
            stats={`${getCountByCategory('Colleges')} Projects`}
            icon={<Construction size={22}/>} 
            color="bg-amber-600"
            filter="Buildings"
            onNavigate={() => navigate('/search?filter=Buildings')}
          />
          <ProjectCard 
            title="Healthcare" 
            stats={`${getCountByCategory('Hospitals')} Projects`}
            icon={<Droplets size={22}/>} 
            color="bg-blue-600"
            filter="Healthcare"
            onNavigate={() => navigate('/search?filter=Healthcare')}
          />
          <ProjectCard 
            title="Transport" 
            stats={`${getCountByCategory('Metro stations')} Projects`}
            icon={<HardHat size={22}/>} 
            color="bg-slate-700"
            filter="Transport"
            onNavigate={() => navigate('/search?filter=Transport')}
          />
          <ProjectCard 
            title="All Projects" 
            stats={`${enhancedProjects.length} Total`}
            icon={<ArrowUpRight size={22}/>} 
            color="bg-emerald-600"
            filter="All"
            onNavigate={() => navigate('/search')}
          />
        </div>
      </section>

      {/* Camera Button Removed - keeping Create Post button only */}
    </div>
  );
}

// Helper function to count projects by category
function getCountByCategory(category: string): number {
  return enhancedProjects.filter((p) => p.category === category).length
}

// ============ POST CARD COMPONENT ============
function PostCard({ post }: { post: Post }) {
  const [votes, setVotes] = useState({ up: post.upvotes || 0, down: post.downvotes || 0 })
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)

  const handleUpvote = () => {
    if (userVote === 'up') {
      setVotes(v => ({ ...v, up: v.up - 1 }))
      setUserVote(null)
    } else {
      if (userVote === 'down') {
        setVotes(v => ({ ...v, down: v.down - 1 }))
      }
      setVotes(v => ({ ...v, up: v.up + 1 }))
      setUserVote('up')
    }
  }

  const handleDownvote = () => {
    if (userVote === 'down') {
      setVotes(v => ({ ...v, down: v.down - 1 }))
      setUserVote(null)
    } else {
      if (userVote === 'up') {
        setVotes(v => ({ ...v, up: v.up - 1 }))
      }
      setVotes(v => ({ ...v, down: v.down + 1 }))
      setUserVote('down')
    }
  }

  const timeAgo = (createdAt: any) => {
    if (!createdAt) return 'recently'
    const now = Date.now()
    const postTime = createdAt.toMillis?.() || createdAt
    const diff = now - postTime
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-5 space-y-3 hover:border-orange-200 transition-all">
      {/* Header: Author & Category */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-black text-[#451a03] uppercase">{post.authorName || 'Citizen'}</p>
          <p className="text-[10px] text-stone-400">{post.category || 'General'} • {timeAgo(post.createdAt)}</p>
        </div>
        <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-[9px] font-black rounded-lg">
          {post.category || 'Update'}
        </span>
      </div>

      {/* Content: Description/Feedback */}
      <p className="text-sm leading-relaxed text-[#451a03] line-clamp-4">
        {post.content || 'No description available'}
      </p>

      {/* Actions: Vote Buttons (Equal Width) */}
      <div className="flex items-center gap-2 pt-2 border-t border-black/5">
        <button
          onClick={handleUpvote}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-90 ${
            userVote === 'up'
              ? 'bg-green-100 text-green-700 border-2 border-green-300'
              : 'bg-stone-100 text-stone-600 hover:bg-green-50 border-2 border-transparent'
          }`}
        >
          <ThumbsUp size={18} strokeWidth={2.5} />
          <span>{votes.up}</span>
        </button>

        <button
          onClick={handleDownvote}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-90 ${
            userVote === 'down'
              ? 'bg-red-100 text-red-700 border-2 border-red-300'
              : 'bg-stone-100 text-stone-600 hover:bg-red-50 border-2 border-transparent'
          }`}
        >
          <ThumbsDown size={18} strokeWidth={2.5} />
          <span>{votes.down}</span>
        </button>
      </div>
    </div>
  )
}

// ============ CREATE POST MODAL ============
function CreatePostModal({ onClose, userName }: { onClose: () => void, userId?: string, userName: string }) {
  const [content, setContent] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Roads')
  const [submitting, setSubmitting] = useState(false)

  const projects = [
    { id: 'project-1', name: 'NH-44 Flyover Expansion' },
    { id: 'project-2', name: 'Metro Line Extension' },
    { id: 'project-10', name: 'Healthcare Center' },
    { id: 'project-20', name: 'Smart City Initiative' },
    { id: 'project-30', name: 'Transport Hub' },
  ]

  const handleSubmit = async () => {
    if (!content.trim() || !selectedProject) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      console.log('📝 Creating post...', { content, selectedProject, selectedCategory, userName })
      // TODO: Save to Firestore
      onClose()
    } catch (error) {
      console.error('❌ Error creating post:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-[32px] p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#451a03]">Create a Post</h2>
          <p className="text-sm text-stone-600">Share your feedback and experiences</p>
        </div>

        {/* Project Selector */}
        <div className="space-y-2">
          <label className="text-xs font-black text-[#451a03] uppercase">Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full p-3 border-2 border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
          >
            <option value="">Choose a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-xs font-black text-[#451a03] uppercase">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.filter(c => c !== 'All Posts').map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-orange-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-black text-[#451a03] uppercase">Your Feedback</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience, observations, or feedback about this project... (like Reddit)"
            maxLength={500}
            className="w-full p-4 border-2 border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
            rows={5}
          />
          <p className="text-[10px] text-stone-400">{content.length}/500</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl border-2 border-black/5 text-[#451a03] font-black text-sm hover:bg-stone-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-black text-sm transition-all active:scale-95"
          >
            {submitting ? '...' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ PROJECT CARD COMPONENT ============
function ProjectCard({ title, stats, icon, color, onNavigate }: { title: string, stats: string, icon: any, color: string, filter?: string, onNavigate?: () => void }) {
  return (
    <button 
      onClick={onNavigate}
      className="flex flex-col gap-6 rounded-[32px] bg-white p-6 shadow-sm border border-black/[0.02] transition-all active:scale-95 hover:shadow-md group hover:border-orange-200 w-full text-left"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} text-white shadow-lg shadow-black/10 group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <div>
        <h4 className="font-black text-[#451a03] tracking-tighter text-lg leading-none mb-2">{title}</h4>
        <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
           <ImageIcon size={10} /> {stats}
        </div>
      </div>
    </button>
  );
}