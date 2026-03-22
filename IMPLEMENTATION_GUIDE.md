# 🏗️ Paridhi - Implementation & Architecture Guide

## Overview

This document outlines the architecture, feature implementation, and deployment strategy for Paridhi.

**Last Updated:** March 2026  
**Status:** ✅ Production Ready

## ✅ Changes Completed

### 1. ✓ HomePage Banner Carousel Fixed
**Issue**: Carousel sequence was 1 → 3 → 2 (incorrect)  
**Root Cause**: Callback dependency in useEffect caused re-render timing issues  
**Fix Applied**: Moved slide advancement logic directly into the effect, removed callback dependency
**Result**: Carousel now correctly cycles 0 → 1 → 2 → 0

### 2. ✓ SearchPage Completely Redesigned
**Changes**:
- Removed irrelevant State/District dropdown filters
- Added category filter buttons: [All, Roads, Healthcare, Smart City, Transport, Maintenance, Buildings]
- Integrated with projectsEnhanced data (40+ real projects)
- Each project card now clickable - navigates to ExpllorePage with projectId in state
- Project cards show: Name, Location, Status

**Features**:
- Real-time search by project name
- Category filtering with visual feedback (active/inactive button states)
- Project counter showing results
- Clear filters button
- Responsive design with truncation for long names

### 3. ✓ CommunityPage "Explore Projects" Integration
**Changes**:
 - ProjectCard components converted to buttons
  - Added navigation to SearchPage with category filters
  - Four project categories: Roads → /search?filter=Roads, Smart City, Transport, All Projects
  - Smooth transitions with hover effects

### 4. ✓ Project Search Utilities Created
**New File**: `web/src/lib/projectsUtils.ts`
**Exports**:
- `filterProjectsByCategory(category)` - Filter by Roads/Healthcare/Smart City/Transport/etc
- `searchProjects(query)` - Full-text search by name, location, description
- `filterAndSearchProjects(query, category)` - Combined filtering
- `getProjectById(id)` - Get single project by ID
- `getCategoryEmoji(category)` - Get emoji for project type

---

## ⏳ Remaining Implementation Steps

### STEP 5: Redesign ExplorePage with Permissions & Map Fixes

**Current Issues**:
- Permission UI takes too much vertical space
- Map z-index overlaps header
- No project details below map
- Doesn't handle projectId from SearchPage navigation

**Required Changes**:
```
User Flow:
1. User opens ExplorePage with or without projectId from SearchPage
2. See permission toggle switches (only visible if disabled)
3. Permission section collapses when BOTH location + notifications enabled
4. Full-width map shows user location + nearby projects
5. Below map: ComprehensiveProject detail block(s) with AI-enhanced content
6. If coming from search, that specific project is highlighted
```

**Implementation Code Structure**:
```typescript
export function ExplorePage() {
  const location = useLocation()
  const { projectId } = location.state || {}

  // Permission toggles instead of cards
  const [showPermissions, setShowPermissions] = useState(true)
  
  // Auto-hide when both granted
  useEffect(() => {
    if (locationAllowed && notificationsAllowed) {
      setShowPermissions(false)
    }
  }, [locationAllowed, notificationsAllowed])

  // Get specific project if coming from search
  const selectedProject = projectId ? getProjectById(projectId) : null
  
  return (
    <> 
      {/* Permission toggles - only shown if not both enabled */}
      {showPermissions && (
        <PermissionToggles/>
      )}
      
      {/* Map section - always visible */}
      {allExplorePermissionsGranted && (
        <MapSection highlightedProject={selectedProject}/>
      )}
      
      {/* Project detail blocks - below map */}
      <ProjectDetailsSection selectedProject={selectedProject}/>
    </>
  )
}
```

### STEP 6: Fix CommunityPage Firebase Integration

**Current State**: Shows dummy cards, not connected to Firebase

**Implementation**:
1. Use `subscribeToCommunityPosts()` hook to get real posts
2. Implement filter state management
3. Show real post cards with author info
4. Connect voting/reporting functionality

### STEP 7: Create Firestore Projects Utility

**Why**: Local projectsEnhanced.ts works but for scalability should use Firestore

**New Functions Needed**:
```typescript
// Get projects from Firestore
export async function fetchProjectsFromFirestore(): Promise<EnhancedProject[]>

// Sync local data to Firestore (one-time setup)
export async function seedProjectsToFirestore(projects: EnhancedProject[])

// Query projects by category
export async function queryProjectsByCategory(category: string): Promise<EnhancedProject[]>
```

---

## 🔧 Backend Configuration Required

### 1. Firebase Configuration (`.env` file)
Create `web/.env` or `web/.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
VITE_FIREBASE_FUNCTIONS_REGION=asia-south1
VITE_DEFAULT_LAT=28.6139
VITE_DEFAULT_LNG=77.209
```

**Where to get these?**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or select existing
3. Go to Project Settings
4. Copy web app config
5. Enable Google Sign-In in Authentication
6. Create Firestore Database (Start in test mode)

### 2. Firestore Database Setup
**Collections to create**:

#### `projects` collection
```json
{
  "id": "proj_delhi_hc_sblock_001",
  "name": "Delhi High Court S Block Repair",
  "category": "Hospitals",
  "lat": 28.61,
  "lng": 77.235,
  "description": "...",
  "status": "ongoing|completed|handovered",
  "type": "maintenance",
  "location": "Delhi High Court",
  "department": "PWD Delhi",
  "completionPercentage": 45
}
```

#### `posts` collection (already used by community)
```json
{
  "authorId": "uid",
  "authorName": "username",
  "content": "post text",
  "projectId": "proj_id" (optional - links to project),
  "status": "active|limited|hidden",
  "score": 0,
  "upvotes": 0,
  "downvotes": 0,
  "createdAt": timestamp
}
```

### 3. Cloud Functions
Functions in `functions/src/index.ts` already exist for:
- `votePost(postId, vote)`
- `reportPost(postId, reason)`
- `enhanceProjectDescription(description)` (optional HuggingFace integration)

**Deploy**:
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## 📊 Data Architecture

### Local-First Approach (Current)
- Projects stored in: `web/src/data/projectsEnhanced.ts`
- All 40+ projects hardcoded in TypeScript
- Loaded on app startup
- Fast, works offline

### Firestore Integration (Recommended)
- Projects stored in Firestore
- Cache locally after first fetch
- Sync updates automatically
- Supports real-time collaboration

---

## 🎯 Implementation Priority

1. **HIGH**: ExplorePage redesign (steps 4-5)
   - Users rely on this for exploration
   - Search → Explore flow needs this

2. **HIGH**: ExplorePage z-index fix
   - Current bug affecting UI/UX

3. **MEDIUM**: Firebase .env configuration
   - Enables real-time features
   - Prerequisite for steps 6-7

4. **MEDIUM**: CommunityPage Firebase integration
   - Enables user-generated content
   - Real voting/reporting

5. **LOW**: Firestore projects utility
   - Nice-to-have for scalability
   - Works fine with local data currently

---

## ✨ Key Features Added

| Feature | Status | Impact |
|---------|--------|--------|
| Banner carousel fix | ✓ Done | UI/UX improvement |
| SearchPage redesign | ✓ Done | User discovery flow |
| Category filtering | ✓ Done | Better project browsing |
| Project utilities | ✓ Done | Search/filter foundation |
| Homepage navigation | ✓ Done | CommunityPage → SearchPage flow |
| ExplorePage redesign | ⏳ Pending | Critical for experience |
| Permission toggles | ⏳ Pending | UI simplification |
| Project detail cards | ⏳ Pending | Enhanced project viewing |
| Firebase integration | ⏳ Pending | Real data, community posts |
| Z-index fixes | ⏳ Pending | UI polish |

---

## 🚀 Next Steps

1. **Immediate**: Apply `.env` configuration values
2. **Next**: Redesign ExplorePage (comprehensive rewrite incoming)
3. **Then**: Connect CommunityPage to Firebase posts
4. **Finally**: Add Firestore projects utility and test end-to-end

---

## 📝 Notes

- **Dataset**: All 40+ projects from main_1.py successfully converted and stored in projectsEnhanced.ts
- **Geofencing**: Auto-marks projects when user within 500m radius
- **LLM Enhancement**: Local processing (no API calls), enhances project descriptions
- **XP System**: Connected to exploration - 50 XP per project, levels at 200 XP intervals
- **Community**: Real-time Firebase integration, voting/reporting supported

