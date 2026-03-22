import * as admin from 'firebase-admin'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions'

admin.initializeApp()

const db = admin.firestore()

type VoteValue = 1 | -1 | 0

function toVoteValue(vote: unknown): VoteValue {
  if (vote === 'up') return 1
  if (vote === 'down') return -1
  return 0
}

function evaluateStatus(upvotes: number, downvotes: number, reports: number) {
  const score = upvotes - downvotes - reports * 2

  if (reports >= 6 || score <= -12) {
    return { score, status: 'hidden' as const }
  }

  if (reports >= 3 || score <= -4) {
    return { score, status: 'limited' as const }
  }

  return { score, status: 'active' as const }
}

export const votePost = onCall({ region: 'asia-south1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to vote.')
  }

  const uid = request.auth.uid

  const postId = String(request.data?.postId ?? '').trim()
  const vote = toVoteValue(request.data?.vote)

  if (!postId) {
    throw new HttpsError('invalid-argument', 'postId is required.')
  }

  const postRef = db.collection('posts').doc(postId)
  const voteRef = postRef.collection('votes').doc(uid)

  await db.runTransaction(async (transaction) => {
    const postSnap = await transaction.get(postRef)
    if (!postSnap.exists) {
      throw new HttpsError('not-found', 'Post not found.')
    }

    const postData = postSnap.data() as {
      upvotes?: number
      downvotes?: number
      reports?: number
    }

    const voteSnap = await transaction.get(voteRef)
    const previousVote = voteSnap.exists ? Number(voteSnap.data()?.value ?? 0) : 0

    let upvotes = Number(postData.upvotes ?? 0)
    let downvotes = Number(postData.downvotes ?? 0)

    if (previousVote === 1) upvotes = Math.max(0, upvotes - 1)
    if (previousVote === -1) downvotes = Math.max(0, downvotes - 1)

    if (vote === 1) upvotes += 1
    if (vote === -1) downvotes += 1

    const reports = Number(postData.reports ?? 0)
    const moderated = evaluateStatus(upvotes, downvotes, reports)

    transaction.update(postRef, {
      upvotes,
      downvotes,
      score: moderated.score,
      status: moderated.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    if (vote === 0) {
      transaction.delete(voteRef)
    } else {
      transaction.set(
        voteRef,
        {
          uid,
          value: vote,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
    }
  })

  return { ok: true }
})

export const reportPost = onCall({ region: 'asia-south1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to report.')
  }

  const uid = request.auth.uid

  const postId = String(request.data?.postId ?? '').trim()
  const reason = String(request.data?.reason ?? '').trim().slice(0, 200)

  if (!postId) {
    throw new HttpsError('invalid-argument', 'postId is required.')
  }

  if (reason.length < 4) {
    throw new HttpsError('invalid-argument', 'Please provide a valid report reason.')
  }

  const postRef = db.collection('posts').doc(postId)
  const reportRef = postRef.collection('reports').doc(uid)

  await db.runTransaction(async (transaction) => {
    const postSnap = await transaction.get(postRef)
    if (!postSnap.exists) {
      throw new HttpsError('not-found', 'Post not found.')
    }

    const reportSnap = await transaction.get(reportRef)
    if (reportSnap.exists) {
      throw new HttpsError('already-exists', 'You already reported this post.')
    }

    const postData = postSnap.data() as {
      upvotes?: number
      downvotes?: number
      reports?: number
    }

    const upvotes = Number(postData.upvotes ?? 0)
    const downvotes = Number(postData.downvotes ?? 0)
    const reports = Number(postData.reports ?? 0) + 1

    const moderated = evaluateStatus(upvotes, downvotes, reports)

    transaction.set(reportRef, {
      uid,
      reason,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    transaction.update(postRef, {
      reports,
      score: moderated.score,
      status: moderated.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  })

  return { ok: true }
})

const blockedWords = ['hate', 'terror', 'abuse']

export const moderatePostOnCreate = onDocumentCreated(
  {
    region: 'asia-south1',
    document: 'posts/{postId}',
  },
  async (event) => {
    const snapshot = event.data
    if (!snapshot) return

    const data = snapshot.data() as {
      content?: string
      status?: string
      upvotes?: number
      downvotes?: number
      reports?: number
    }

    const content = String(data.content ?? '').toLowerCase()
    const hasBlockedWord = blockedWords.some((word) => content.includes(word))

    const upvotes = Number(data.upvotes ?? 0)
    const downvotes = Number(data.downvotes ?? 0)
    const reports = Number(data.reports ?? 0)
    const moderated = evaluateStatus(upvotes, downvotes, reports)

    const status = hasBlockedWord ? 'limited' : data.status ?? moderated.status

    await snapshot.ref.set(
      {
        status,
        score: moderated.score,
        upvotes,
        downvotes,
        reports,
        moderatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    logger.info('Post moderation evaluated', {
      postId: snapshot.id,
      status,
      score: moderated.score,
      hasBlockedWord,
    })
  },
)

// Cloud Function to enhance project descriptions using HuggingFace
export const enhanceProjectDescription = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth || request.auth.token.admin !== true) {
      throw new HttpsError('permission-denied', 'Only admins can enhance project descriptions.')
    }

    const projectId = String(request.data?.projectId ?? '').trim()
    const description = String(request.data?.description ?? '').trim()

    if (!projectId || !description || description.length < 10) {
      throw new HttpsError('invalid-argument', 'projectId and description are required.')
    }

    try {
      // Call HuggingFace Inference API
      // Using a free model: facebook/bart-large-cnn for summarization
      const hfApi = process.env.HUGGING_FACE_API_KEY
      if (!hfApi) {
        throw new Error('HUGGING_FACE_API_KEY is not configured.')
      }

      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApi}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: description,
          parameters: {
            max_length: 150,
            min_length: 50,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        logger.error('HuggingFace API error', { error })
        throw new Error(`HuggingFace API error: ${response.status}`)
      }

      const result = await response.json() as Array<{ summary_text: string }>
      const enhancedContent = result[0]?.summary_text || description

      logger.info('Project description enhanced', {
        projectId,
        originalLength: description.length,
        enhancedLength: enhancedContent.length,
      })

      return {
        ok: true,
        enhancedContent,
      }
    } catch (error) {
      logger.error('Project enhancement failed', {
        projectId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      throw new HttpsError('internal', 'Failed to enhance project description.')
    }
  },
)
