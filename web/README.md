# Paridhi Web

Mobile-first PWA frontend for Paridhi (React + TypeScript + Vite + Tailwind + Firebase).

## Setup

1. Copy `.env.example` to `.env`.
2. Fill all `VITE_FIREBASE_*` values from your Firebase project.
3. Install dependencies:
   - `npm install`
4. Run app:
   - `npm run dev`

## Build

- `npm run build`
- `npm run preview`

## Implemented

- Firebase Auth (Google sign-in/out) wired through app context.
- Firestore community feed with real-time updates.
- Create post flow with auth-gated glassmorphism modal.
- Downvote/upvote/report controls connected to callable Cloud Functions.
- Server-side moderation status model (`active`, `limited`, `hidden`) with traction score updates.
- Explore page built with Leaflet + OpenStreetMap and category-based emoji markers.
- Permission gate: users must enable both location and notification to unlock map/projects and progress.
- Project categories included: Hospitals, Colleges, Bridges, Metro stations, Road projects, Flyovers, Smart city projects.
- Tangerine/black/white visual theme across core pages.
- Elevated center-action bottom navigation style.
- Native PWA (`manifest.webmanifest`, `sw.js`) and install metadata.

## Backend wiring used by UI

- Callable functions expected:
  - `votePost`
  - `reportPost`
- Firestore collection used:
  - `posts`
- Firestore subcollections used:
  - `posts/{postId}/votes`
  - `posts/{postId}/reports`
