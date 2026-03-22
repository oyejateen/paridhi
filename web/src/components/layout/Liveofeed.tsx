import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LiveUpdates from "./LiveUpdates"

export default function Liveofeed() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showCreatePost, setShowCreatePost] = useState(false)

  const handleAddPost = () => {
    if (!user) {
      // Redirect to profile if not authenticated (like ProgressPage pattern)
      navigate('/profile')
    } else {
      // If authenticated, allow post creation
      setShowCreatePost(true)
      console.log('📝 Opening post creation form...')
    }
  }

  return (
    <section className="mt-10">
      <div className="px-6 flex justify-between items-center mb-5">
        <div>
          <h3 className="text-[#451a03] text-[14px] font-black uppercase tracking-[0.12em]">
            Live Opportunities Feed
          </h3>
          <div className="h-1 w-12 bg-orange-500 rounded-full mt-1" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddPost}
            className="h-8 w-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all active:scale-90"
            title={user ? "Add new post" : "Click to create post (redirects to profile)"}
          >
            <Plus size={18} strokeWidth={3} />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-stone-400 text-[9px] font-bold uppercase tracking-widest">
              Live Now
            </span>
          </div>
        </div>
      </div>

      {/* Post Creation Section (shown only when user is authenticated) */}
      {showCreatePost && user && (
        <div className="mx-6 mb-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl space-y-3">
          <p className="text-xs font-bold text-orange-900">
            ✏️ Create a post about this project
          </p>
          <textarea
            placeholder="Share your update about this project..."
            className="w-full p-3 text-xs border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreatePost(false)}
              className="flex-1 bg-white border border-orange-300 text-orange-900 text-xs font-black py-2 rounded-xl hover:bg-orange-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log('Post submitted')
                setShowCreatePost(false)
              }}
              className="flex-1 bg-orange-600 text-white text-xs font-black py-2 rounded-xl hover:bg-orange-700 transition-colors active:scale-95"
            >
              Post
            </button>
          </div>
        </div>
      )}

      <LiveUpdates />
    </section>
  )
}
