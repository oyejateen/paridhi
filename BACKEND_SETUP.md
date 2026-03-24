# Paridhi PWA - Backend Setup & Firebase Emulator Guide

## 🚀 Quick Start: Running the Backend Locally

### Prerequisites
- Node.js 20+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created at [Firebase Console](https://console.firebase.google.com)

---

## 📋 Step 1: Setup Firebase CLI Credentials

```bash
# Login to Firebase
firebase login

# Verify authentication
firebase projects:list
```

---

## 📋 Step 2: Initialize Firebase in Your Project

Navigate to your project root and ensure `firebase.json` exists:

```bash
cd d:\STUDY\ MATERIAL\ \(STUFF\)\Hackathons\indianowait
firebase init
```

**Select these options**:
- ✓ Firestore Database
- ✓ Cloud Functions  
- ✓ Hosting
- ✓ Emulators

**When prompted**:
```
? Project: your-project-id
? Firestore preconfigured rules: (Leave default)
? Functions region: asia-south1
? Emulator ports: (Use defaults)
```

---

## 🔥 Step 3: Start Firebase Emulator

This runs Firestore, Functions, and Authentication locally:

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Start emulator suite
firebase emulators:start
```

**Output should show:**
```
✔ firestore: localhost:8080
✔ functions: localhost:5001
✔ Emulator UI: localhost:4000
```

**Keep this terminal open!**

---

## 💾 Step 4: Seed Dummy Posts to Firestore

In a **new terminal**, add sample posts with category data:

```bash
# Still in project root
node scripts/seedDummyPosts.js
```

### Create seed script: `scripts/seedDummyPosts.js`

```javascript
const admin = require('firebase-admin');

// Connect to local emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'demo-project' // Use any name for emulator
});

const db = admin.firestore();

const DUMMY_POSTS = [
  // Roads Category
  {
    authorId: 'seed-user-1',
    authorName: 'Admin',
    content: 'Major pothole fixed on NH-44 near Delhi! Great work by the team. 🛣️',
    projectId: 'project-1', // Links to first project
    category: 'Roads',
    status: 'active',
    upvotes: 24,
    downvotes: 1,
    reports: 0,
    score: 23,
    createdAt: admin.firestore.Timestamp.now(),
    imageUrl: null
  },
  {
    authorId: 'seed-user-2',
    authorName: 'Civic Volunteer',
    content: 'The new cycle track on MG Road is amazing! Much safer for commuters now. 🚴',
    projectId: 'project-2',
    category: 'Roads',
    status: 'active',
    upvotes: 15,
    downvotes: 0,
    reports: 0,
    score: 15,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 3600000)),
    imageUrl: null
  },
  
  // Healthcare Category
  {
    authorId: 'seed-user-3',
    authorName: 'Health Worker',
    content: 'New vaccination center opened in South Delhi. Check-ups are free! 💉',
    projectId: 'project-10',
    category: 'Healthcare',
    status: 'active',
    upvotes: 32,
    downvotes: 0,
    reports: 0,
    score: 32,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 7200000)),
    imageUrl: null
  },
  {
    authorId: 'seed-user-4',
    authorName: 'Community Member',
    content: 'Visited the new health camp at Lajpat Nagar. Staff is very helpful!',
    projectId: 'project-11',
    category: 'Healthcare',
    status: 'active',
    upvotes: 18,
    downvotes: 0,
    reports: 0,
    score: 18,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 10800000)),
    imageUrl: null
  },

  // Smart City Category
  {
    authorId: 'seed-user-5',
    authorName: 'Tech Enthusiast',
    content: 'Smart traffic lights are reducing congestion by 30%! Great implementation. 🚦',
    projectId: 'project-20',
    category: 'Smart City',
    status: 'active',
    upvotes: 41,
    downvotes: 2,
    reports: 0,
    score: 39,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 14400000)),
    imageUrl: null
  },
  {
    authorId: 'seed-user-6',
    authorName: 'Urban Planner',
    content: 'The new IoT sensors in the city are providing real-time air quality data. Impressive!',
    projectId: 'project-21',
    category: 'Smart City',
    status: 'active',
    upvotes: 28,
    downvotes: 1,
    reports: 0,
    score: 27,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 18000000)),
    imageUrl: null
  },

  // Transport Category
  {
    authorId: 'seed-user-7',
    authorName: 'Daily Commuter',
    content: 'Metro extension to Dwarka is game-changing! 25 min faster commute now. 🚇',
    projectId: 'project-30',
    category: 'Transport',
    status: 'active',
    upvotes: 56,
    downvotes: 3,
    reports: 0,
    score: 53,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 21600000)),
    imageUrl: null
  },
  {
    authorId: 'seed-user-8',
    authorName: 'Bus Rider',
    content: 'New electric bus fleet is running smoothly! Air quality improvement is noticeable. ♻️',
    projectId: 'project-31',
    category: 'Transport',
    status: 'active',
    upvotes: 19,
    downvotes: 0,
    reports: 0,
    score: 19,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 25200000)),
    imageUrl: null
  },

  // Maintenance Category
  {
    authorId: 'seed-user-9',
    authorName: 'Maintenance Crew',
    content: 'Completed routine maintenance of water pipelines in Sector 12. System operating smoothly.',
    projectId: 'project-40',
    category: 'Maintenance',
    status: 'active',
    upvotes: 12,
    downvotes: 0,
    reports: 0,
    score: 12,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 28800000)),
    imageUrl: null
  },
  {
    authorId: 'seed-user-10',
    authorName: 'Infrastructure Inspector',
    content: 'Street lights upgraded to LED in Connaught Place. 40% energy savings expected! 💡',
    projectId: 'project-41',
    category: 'Maintenance',
    status: 'active',
    upvotes: 22,
    downvotes: 0,
    reports: 0,
    score: 22,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 32400000)),
    imageUrl: null
  },

  // Buildings Category
  {
    authorId: 'seed-user-11',
    authorName: 'Architect',
    content: 'New green building in Gurugram achieves LEED Platinum! Sustainable development at its best. 🏢',
    projectId: 'project-50',
    category: 'Buildings',
    status: 'active',
    upvotes: 34,
    downvotes: 1,
    reports: 0,
    score: 33,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 36000000)),
    imageUrl: null
  },
  {
    authorId: 'seed-user-12',
    authorName: 'Construction Manager',
    content: 'Affordable housing project completed on time! 500 families got new homes. 🏘️',
    projectId: 'project-51',
    category: 'Buildings',
    status: 'active',
    upvotes: 47,
    downvotes: 0,
    reports: 0,
    score: 47,
    createdAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 39600000)),
    imageUrl: null
  },
];

async function seedDatabase() {
  console.log('🌱 Starting to seed Firestore with dummy posts...');
  console.log('📍 Using Firestore Emulator at localhost:8080\n');

  try {
    const batch = db.batch();
    let count = 0;

    for (const post of DUMMY_POSTS) {
      const docRef = db.collection('posts').doc();
      
      // Add votes subcollection (demonstrates transaction capability)
      await docRef.set(post);
      
      // Create empty votes subcollection
      await docRef.collection('votes').doc('_placeholder').set({ placeholder: true });
      await docRef.collection('votes').doc('_placeholder').delete();

      count++;
      console.log(`✅ Added post ${count}/${DUMMY_POSTS.length}: "${post.content.substring(0, 40)}..."`);
    }

    console.log('\n✨ All dummy posts seeded successfully!');
    console.log('📊 Total posts added:', count);
    console.log('\n🔗 View in Firestore Emulator UI: http://localhost:4000\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedDatabase();
```

### Create the script file:

```bash
mkdir scripts
# Create scripts/seedDummyPosts.js with content above
```

---

## 🔌 Step 5: Connect Frontend to Local Emulator

Update `web/.env.local`:

```env
# Use emulator for development
VITE_FIREBASE_EMULATOR_HOST=localhost:8080
VITE_FIRESTORE_EMULATOR_HOST=localhost:8080

# Still need real config for auth (optional)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

### Update `web/src/lib/firebase.ts`:

Add emulator configuration at the top:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getMessaging, getToken } from 'firebase/messaging'

// ... existing config code ...

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const messaging = getMessaging(app)

// Connect to emulators in development
if (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
    console.log('✅ Connected to Firebase Emulators')
  } catch (error) {
    console.log('Emulator already connected or not available')
  }
}
```

---

## 🌐 Step 6: Run Frontend Dev Server

In **another new terminal**:

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`

---

## 📱 Step 7: Test the Backend

### Create a Test Post:

1. Click the **🟠 Plus button** in Live Feed
2. If not logged in, click "Sign In with Google"
3. In emulator, use any test email (e.g., `test@example.com`)
4. Write a test post
5. Submit

### View in Emulator UI:

Open `http://localhost:4000` to see:
- All Firestore data
- Authentication tokens
- Function execution logs

---

## 🔍 Dashboard Tabs Explained

| Tab | Purpose |
|-----|---------|
| **Firestore** | View all posts, categories, vote data |
| **Authentication** | See logged-in test users |
| **Realtime Database** | If using (optional) |
| **Functions** | View function execution logs |
| **Hosting** | Preview hosted site (if deployed) |

---

## 🐛 Troubleshooting Backend

### Issue: "Cannot connect to emulator"
```bash
# Make sure emulator is running
firebase emulators:start

# Verify ports are open
netstat -an | grep 8080
```

### Issue: Seed script fails
```bash
# Install firebase-admin in project root
npm install firebase-admin

# Run seed script from project root
node scripts/seedDummyPosts.js
```

### Issue: Posts not showing in frontend
1. Check browser DevTools → Network tab
2. Verify `connectFirestoreEmulator()` connected
3. Refresh page: `Cmd/Ctrl + Shift + R`
4. Check Console for errors

---

## 🚀 Deploying to Production

When ready to go live:

### 1. Deploy Functions First
```bash
cd functions
npm install
firebase deploy --only functions
```

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore
```

### 3. Deploy Frontend to Hosting
```bash
cd web
npm run build
firebase deploy --only hosting
```

### 4. Update `.env.production`
```env
# Remove emulator settings
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_PROJECT_ID=your_production_project
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

---

## 📊 Firestore Schema (Production)

```
posts/ (collection)
├── {postId} (document)
│   ├── authorId: string
│   ├── authorName: string
│   ├── content: string
│   ├── projectId: string (foreign key)
│   ├── category: string (Roads|Healthcare|Smart City|Transport|Maintenance|Buildings)
│   ├── status: string (active|limited|hidden)
│   ├── upvotes: number
│   ├── downvotes: number
│   ├── reports: number
│   ├── score: number (calculated)
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── votes/ (subcollection)
│       └── {userId}
│           ├── value: number (1|-1|0)
│           └── updatedAt: timestamp
│
projects/ (collection) [optional]
├── {projectId}
│   ├── name: string
│   ├── location: string
│   ├── category: string
│   ├── lat: number
│   ├── lng: number
│   ├── description: string
│   └── status: string
```

---

## ✅ Final Verification Checklist

- [ ] Firebase emulator running (`firebase emulators:start`)
- [ ] Dummy posts seeded (`node scripts/seedDummyPosts.js`)
- [ ] Frontend dev server running (`npm run dev`)
- [ ] `.env.local` configured for emulator
- [ ] `firebase.ts` has emulator connection logic
- [ ] Posts visible in Emulator UI (http://localhost:4000)
- [ ] Frontend can create new posts
- [ ] Posts appear with correct category
- [ ] Voting/reporting works
- [ ] Auto-moderation removes flagged posts

---

## 📞 Need Help?

**Common Issues & Solutions**:

| Error | Fix |
|-------|-----|
| `java: command not found` | Install Java (required for emulator) |
| `Port 8080 already in use` | Kill process: `lsof -i :8080` then `kill -9 <pid>` |
| `Posts not saving` | Check Firestore Rules in console |
| `Auth prompts but doesn't work` | Make sure emulator is started first |

---

## 🎉 You're All Set!

Your Paridhi backend is now running locally with:
- ✅ Real-time database (Firestore)
- ✅ Cloud Functions (voting, reporting, moderation)
- ✅ Authentication (test users)
- ✅ 12 sample posts (2 per category)
- ✅ Live UI dashboard

**Next Steps**:
1. Create real posts through the UI
2. Test voting/reporting system
3. Deploy when ready (see Deployment section above)

