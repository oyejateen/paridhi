import { useEffect, useMemo, useState } from 'react'
import {
  createCommunityPost,
  reportCommunityPost,
  subscribeToCommunityPosts,
  voteOnCommunityPost,
} from '../lib/community/community'
import { useAuth } from '../context/AuthContext'
import type { CommunityPost } from '../types/community'

export function HomePage() {
  const { user, signIn, isConfigured } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [showComposer, setShowComposer] = useState(false)
  const [content, setContent] = useState('')
  const [reportReasonByPost, setReportReasonByPost] = useState<Record<string, string>>({})
  const [pendingActionByPost, setPendingActionByPost] = useState<Record<string, boolean>>({})
  const [submittingPost, setSubmittingPost] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToCommunityPosts(
      (nextPosts) => {
        setPosts(nextPosts)
        setLoading(false)
      },
      (nextError) => {
        setError(nextError.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [isConfigured])

  const sortedPosts = useMemo(() => posts, [posts])

  async function openCreatePost() {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }

    setShowComposer(true)
  }

  async function handleGoogleLogin() {
    try {
      await signIn()
      setShowAuthPrompt(false)
      setShowComposer(true)
      setError(null)
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Login failed.')
    }
  }

  async function handleCreatePost() {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }

    try {
      setSubmittingPost(true)
      await createCommunityPost(content, user)
      setContent('')
      setShowComposer(false)
      setError(null)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create post.')
    } finally {
      setSubmittingPost(false)
    }
  }

  async function handleVote(postId: string, vote: 'up' | 'down') {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }

    try {
      setPendingActionByPost((prev) => ({ ...prev, [postId]: true }))
      await voteOnCommunityPost(postId, vote)
      setError(null)
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : 'Unable to vote right now.')
    } finally {
      setPendingActionByPost((prev) => ({ ...prev, [postId]: false }))
    }
  }

  async function handleReport(postId: string) {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }

    const reason = (reportReasonByPost[postId] || '').trim()
    if (reason.length < 4) {
      setError('Please provide a short reason (min 4 chars) before reporting.')
      return
    }

    try {
      setPendingActionByPost((prev) => ({ ...prev, [postId]: true }))
      await reportCommunityPost(postId, reason)
      setReportReasonByPost((prev) => ({ ...prev, [postId]: '' }))
      setError(null)
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : 'Unable to report this post.')
    } finally {
      setPendingActionByPost((prev) => ({ ...prev, [postId]: false }))
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-lg shadow-orange-200">
        <p className="text-sm/5 text-orange-100">Welcome back</p>
        <h2 className="mt-1 text-2xl font-semibold">Explore. Discuss. Earn.</h2>
        <p className="mt-2 text-sm text-orange-100">Paridhi community is live with moderated civic discussions.</p>
      </div>

      {!isConfigured ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          Firebase credentials are not configured yet. Add values in `.env` to activate auth, posts, moderation, reports, and voting.
        </div>
      ) : null}

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Government Highlights</h3>
        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
          <li>• Metro access ramps expansion in Phase-2 corridors.</li>
          <li>• River cleanup smart-monitoring pilot launched.</li>
          <li>• New electric bus charging depots approved.</li>
        </ul>
      </div>

      <div className="space-y-3 pb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Community Feed</h3>

        {loading ? <p className="text-sm text-neutral-500">Loading posts...</p> : null}

        {!loading && sortedPosts.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 shadow-sm">
            No community posts yet. Be the first to share a civic discovery.
          </div>
        ) : null}

        {sortedPosts.map((post) => {
          const isPending = Boolean(pendingActionByPost[post.id])

          return (
            <article key={post.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-orange-100">
                    {post.authorPhotoURL ? (
                      <img src={post.authorPhotoURL} alt={post.authorName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-xs font-semibold text-orange-700">
                        {post.authorName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-700">{post.authorName}</p>
                    <p className="text-[11px] uppercase tracking-wide text-neutral-400">{post.status}</p>
                  </div>
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">Score {post.score}</span>
              </div>

              <p className="mt-3 text-sm text-neutral-700">{post.content}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <button
                  disabled={isPending}
                  onClick={() => handleVote(post.id, 'up')}
                  className="rounded-full border border-neutral-200 px-3 py-1 font-medium text-neutral-700 transition hover:border-orange-300 hover:text-orange-700 disabled:opacity-40"
                >
                  👍 {post.upvotes}
                </button>
                <button
                  disabled={isPending}
                  onClick={() => handleVote(post.id, 'down')}
                  className="rounded-full border border-neutral-200 px-3 py-1 font-medium text-neutral-700 transition hover:border-orange-300 hover:text-orange-700 disabled:opacity-40"
                >
                  👎 {post.downvotes}
                </button>
                <span className="rounded-full border border-neutral-200 px-3 py-1 text-neutral-500">🚩 {post.reports}</span>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={reportReasonByPost[post.id] || ''}
                  onChange={(event) =>
                    setReportReasonByPost((prev) => ({
                      ...prev,
                      [post.id]: event.target.value,
                    }))
                  }
                  placeholder="Reason to report"
                  className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-orange-400"
                />
                <button
                  disabled={isPending}
                  onClick={() => handleReport(post.id)}
                  className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  Report
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <button
        onClick={openCreatePost}
        className="fixed bottom-28 right-6 z-30 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200"
      >
        + Create Post
      </button>

      {showComposer ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-5">
          <div className="w-full max-w-sm rounded-3xl border border-white/30 bg-white/70 p-5 shadow-xl backdrop-blur-xl">
            <h4 className="text-lg font-semibold">Create a community post</h4>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="Share what you discovered in your city..."
              className="mt-3 w-full rounded-2xl border border-neutral-200 px-3 py-3 text-sm outline-none transition focus:border-orange-400"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreatePost}
                disabled={submittingPost}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submittingPost ? 'Posting...' : 'Post'}
              </button>
              <button
                onClick={() => setShowComposer(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAuthPrompt ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-5">
          <div className="w-full max-w-sm rounded-3xl border border-white/30 bg-white/70 p-5 shadow-xl backdrop-blur-xl">
            <h4 className="text-lg font-semibold">Sign in required</h4>
            <p className="mt-2 text-sm text-neutral-700">
              Continue with Google to post, vote, downvote, and report content.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={handleGoogleLogin} className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
                Continue with Google
              </button>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="fixed left-1/2 top-16 z-50 w-[92%] max-w-sm -translate-x-1/2 rounded-xl bg-black px-3 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      ) : null}
    </section>
  )
}
