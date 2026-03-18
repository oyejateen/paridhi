# 🌍 Paridhi - Civic Infrastructure Exploration PWA

> Transform public infrastructure into an interactive, transparent, and gamified exploration experience.

## 📋 Project Overview

**Paridhi** is a mobile-first Progressive Web App that gamifies civic infrastructure exploration. Users can discover nearby infrastructure projects, engage with their community through posts and votes, earn XP and badges, and unlock insights about urban development.

**Platform:** Mobile-first PWA (iOS, Android, Web)  
**Stack:** React + TypeScript + Tailwind + Firebase (Auth, Firestore, Cloud Functions)  
**Region:** Asia-South1 (India)

See [project.md](project.md) for full PRD.

---

## 🎯 MVP Features
- **Community Feed:** Real-time posts with upvote/downvote/reporting moderation
- **Infrastructure Map:** OpenStreetMap with 7 project categories (emoji markers)
- **Permission Gating:** Location + Notification required to unlock Explore/Progress
- **User Progression:** XP, levels, and badges based on exploration count
- **Multi-User Persistence:** All data synced to Firestore per authenticated user
- **Auth:** Google OAuth sign-in/sign-out
- **Theme:** Tangerine/black/white design with elevated bottom navigation

---

## 📁 Project Structure

```
├── web/                          # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/          # React components (Layout, Cards, etc.)
│   │   ├── context/             # Context providers (Auth, Permissions, Exploration)
│   │   ├── pages/               # Page components (Home, Explore, Progress, Profile)
│   │   ├── lib/                 # Firebase setup & community module
│   │   ├── data/                # Project dataset (7 categories)
│   │   ├── types/               # TypeScript interfaces
│   │   └── index.css            # Tailwind + custom styling
│   ├── public/                  # PWA assets (manifest, service worker)
│   ├── package.json
│   └── vite.config.ts
│
├── functions/                    # Firebase Cloud Functions (Node.js)
│   ├── src/index.ts             # votePost, reportPost, moderatePostOnCreate
│   └── package.json
│
├── firebase.json                # Firebase project config
├── firestore.rules              # Security rules (public read, auth-gated write)
├── firestore.indexes.json       # Firestore indexes (status, score, createdAt)
├── .firebaserc.example          # Firebase CLI config template
├── .gitignore                   # Git exclusions (KEEP .env SECRET!)
├── .env.example                 # Environment template (copy to .env)
└── project.md                   # Product Requirements Document (PRD)
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 20 or higher
- npm or yarn
- Firebase project (free tier eligible)
- Git account (for GitHub push)

### 1. Clone Repository (After GitHub Push)

```bash
git clone https://github.com/YOUR_USERNAME/paridhi.git
cd paridhi
```

### 2. Install Dependencies

```bash
# Install web dependencies
cd web
npm install

# Install functions dependencies
cd ../functions
npm install
```

### 3. Configure Firebase

**Copy template files:**
```bash
cd ../
cp .firebaserc.example .firebaserc
cp web/.env.example web/.env
```

**Edit `.firebaserc`:**
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

**Edit `web/.env`:**
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_web_push_vapid_key
VITE_FIREBASE_FUNCTIONS_REGION=asia-south1
VITE_USE_FIREBASE_EMULATORS=false
VITE_DEFAULT_LAT=28.6139
VITE_DEFAULT_LNG=77.2090
```

> ⚠️ **IMPORTANT:** Get these from [Firebase Console](https://console.firebase.google.com) → Project Settings → General

### 4. Verify Builds

```bash
# Web build
cd web && npm run build

# Functions build
cd ../functions && npm run build
```

Both should complete without errors.

---

## 🚀 Local Development

```bash
cd web
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Testing Locally

1. **Sign In:** Click "Create Post" → Google sign-in
2. **Create Post:** Type a message (4+ chars) → Submit
3. **Vote:** Upvote/downvote posts in feed
4. **Explore:** Go to Explore tab → Grant location + notification → See map with markers
5. **Progress:** Go to Progress tab → Click "Mark Explored" on a project → Watch XP/badges update

---

## 🔥 Firebase Deployment

### Deploy Functions & Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes,functions
```

### Deploy Hosting

```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

### Verify Deployment

```bash
firebase open hosting
```

---

## 📊 Backend Architecture

### Cloud Functions (3 Callables)

#### `votePost` 
- **Purpose:** Upvote/downvote community posts
- **Moderation:** Updates score; triggers status change (`active` → `limited` → `hidden`)
- **Auth:** Requires sign-in

#### `reportPost`
- **Purpose:** Report inappropriate posts
- **Moderation:** Increments report counter; blocks duplicate reports per user
- **Auth:** Requires sign-in

#### `moderatePostOnCreate` (Trigger)
- **Purpose:** Pre-evaluate new posts on creation
- **Moderation:** Scans for blocked words; sets initial `status`
- **Trigger:** Firestore `onCreate` on `posts` collection

### Firestore Schema

**Collections:**
- `posts/{postId}` - Community posts (public read, auth create, moderation functions update)
  - `votes/{userId}` - User votes (auth read/write)
  - `reports/{userId}` - User reports (auth create/read, no update)
- `users/{userId}` - User profiles (name, email, permissions, exploredProjectIds)

**Security Rules:**
- Posts: Public read, auth-gated create (4–600 char content), functions-only update
- Votes/Reports: Auth-gated with user-scoped access
- Users: Public read, owner-only create/update

---

## 🎨 Theme & Design

**Color Palette:**
- Primary: Tangerine (`#f97316`, `#ea580c`)
- Secondary: Black (`#111111`)
- Accent: White (`#ffffff`)
- Background: Warm cream (`#fff7f0`)

**Key Components:**
- TopHeader: Sticky tangerine gradient with user profile
- BottomNav: Floating pill with 3 side tabs + elevated center Explore button
- Cards: Rounded-3xl with 2xl borders and shadow-lg elevation

---

## 📦 Infrastructure Data

**7 Project Categories** (with emoji markers):
1. 🏥 Hospitals
2. 🎓 Colleges
3. 🌉 Bridges
4. 🚇 Metro Stations
5. 🛣️ Road Projects
6. 🚧 Flyovers
7. 💡 Smart City Projects

Default map center: New Delhi (28.6139°N, 77.2090°E)


---

## 📝 Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local dev server (web/) |
| `npm run build` | Production build (web/) |
| `npm run lint` | ESLint check (web/) |
| `npm run preview` | Preview production build locally (web/) |
| `npm run build` | Compile TypeScript (functions/) |
| `firebase emulators:start` | Local Firebase emulator suite |
| `firebase deploy` | Deploy all (rules, indexes, functions, hosting) |
| `firebase logs` | View Cloud Function logs |
