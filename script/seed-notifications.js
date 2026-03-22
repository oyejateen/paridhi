/**
 * Seed Geofence Notifications
 * Creates dummy geofence-triggered notifications in Firestore
 * Run with: node script/seed-notifications.js
 */

const admin = require('firebase-admin');

// Connect to emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'pranidhi-3c2ad'
});

const db = admin.firestore();

// Get user ID from command line or use default
// Usage: node script/seed-notifications.js [USER_ID]
// Example: node script/seed-notifications.js your-actual-user-id
const TEST_USER_ID = process.argv[2] || 'fg1fwV3Ce6TKcpV8bHL2wLR4rEgH';

const DUMMY_GEOFENCE_NOTIFICATIONS = [
  {
    userId: TEST_USER_ID,
    type: 'geofence',
    title: '📍 Delhi High Court Repair Work',
    message: 'You\'ve entered the Delhi High Court S Block repair project area. View updates and progress.',
    projectId: 'proj_delhi_hc_sblock_001',
    projectName: 'Delhi High Court S Block Repair',
    projectCategory: 'Hospitals',
    lat: 28.61,
    lon: 77.235,
    read: false,
    createdAt: admin.firestore.Timestamp.now(),
    triggeredAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 300000)) // 5 min ago
  },
  {
    userId: TEST_USER_ID,
    type: 'geofence',
    title: '📍 Anti-Smog Gun Deployment',
    message: 'You\'ve entered the Air Pollution Control project area. Progress: 100% complete.',
    projectId: 'proj_air_pollution_001',
    projectName: 'Anti-Smog Gun Deployment',
    projectCategory: 'Smart city projects',
    lat: 28.58,
    lon: 77.05,
    read: false,
    createdAt: admin.firestore.Timestamp.now(),
    triggeredAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 900000)) // 15 min ago
  },
  {
    userId: TEST_USER_ID,
    type: 'geofence',
    title: '📍 CCTV Public Safety Network',
    message: 'You\'ve entered the CCTV Surveillance project area. 1050 cameras installed.',
    projectId: 'proj_cctv_ac40_001',
    projectName: 'CCTV Surveillance AC-40',
    projectCategory: 'Smart city projects',
    lat: 28.62,
    lon: 77.21,
    read: false,
    createdAt: admin.firestore.Timestamp.now(),
    triggeredAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1800000)) // 30 min ago
  }
];

async function seedNotifications() {
  try {
    console.log('🌱 Seeding geofence notifications...');
    console.log(`📍 Using Firestore Emulator at localhost:8080`);
    console.log(`👤 Test User ID: ${TEST_USER_ID}\n`);

    for (let i = 0; i < DUMMY_GEOFENCE_NOTIFICATIONS.length; i++) {
      const notification = DUMMY_GEOFENCE_NOTIFICATIONS[i];
      
      const docRef = await db.collection('notifications').add(notification);
      
      console.log(`✅ Added notification ${i + 1}/3: "${notification.title}"`);
      console.log(`   📌 Project: ${notification.projectName} (${notification.projectCategory})`);
      console.log(`   📄 Doc ID: ${docRef.id}`);
      console.log(`   ⏰ Time: ${notification.triggeredAt.toDate().toLocaleString()}\n`);
    }

    console.log('✨ All geofence notifications seeded successfully!');
    console.log(`\n🔍 To view in Firestore Emulator UI:`);
    console.log(`   → http://localhost:4000`);
    console.log(`   → Go to Firestore → "notifications" collection\n`);
    console.log(`📱 To test in app:`);
    console.log(`   1. Go to /profile page and sign in with Google`);
    console.log(`   2. Your UID is saved in localStorage as 'paridhi:userId'`);
    console.log(`   3. Seed notifications: node script/seed-notifications.js YOUR_UID`);
    console.log(`   4. Go to /notifications page to see the notifications`);
    console.log(`   5. TAP any notification to view full project details (like SearchPage)!`);
    console.log(`   6. Projects show on map with completion %, can mark as explored\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    process.exit(1);
  }
}

seedNotifications();
