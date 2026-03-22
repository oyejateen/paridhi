const admin = require('firebase-admin');

// Connect to local emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'pranidhi-3c2ad' // Match frontend Firebase config
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