/**
 * Initialize Firebase Analytics Collections
 * Creates the initial collections and documents for SimulateAI analytics
 */

// Import Firebase Admin SDK (for Node.js)
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'simulateai-research',
});

const db = admin.firestore();

async function setupAnalyticsCollections() {
  console.log('🔥 Setting up Firebase Analytics Collections...');

  const collections = [
    {
      name: 'analytics_scenario_performance',
      description:
        'Tracks scenario views, completions, ratings, and user interactions',
    },
    {
      name: 'analytics_framework_engagement',
      description:
        'Monitors philosophical framework selection and switching patterns',
    },
    {
      name: 'analytics_session_tracking',
      description:
        'Captures user navigation, interactions, and session durations',
    },
    {
      name: 'analytics_platform_metrics',
      description: 'Overall platform performance and usage statistics',
    },
  ];

  for (const collection of collections) {
    try {
      console.log(`📊 Creating collection: ${collection.name}`);

      // Create initial document to establish collection
      await db.collection(collection.name).doc('_init').set({
        initialized: true,
        created: admin.firestore.FieldValue.serverTimestamp(),
        description: collection.description,
        version: '1.0',
        platform: 'SimulateAI',
        purpose: 'System analytics and research data collection',
      });

      console.log(`✅ Created collection: ${collection.name}`);

      // Add a test document to verify write permissions
      await db.collection(collection.name).add({
        type: 'test_metric',
        source: 'setup-script',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        data: {
          setupTest: true,
          collectionName: collection.name,
        },
      });

      console.log(`✅ Test document added to: ${collection.name}`);
    } catch (error) {
      console.error(
        `❌ Failed to create collection ${collection.name}:`,
        error.message
      );
    }
  }

  console.log('🎉 Analytics collections setup complete!');

  // Test reading from collections to verify permissions
  console.log('🧪 Testing collection access...');

  try {
    for (const collection of collections) {
      const snapshot = await db.collection(collection.name).limit(1).get();
      console.log(
        `✅ ${collection.name}: ${snapshot.size} document(s) accessible`
      );
    }

    console.log('🎉 All collections are accessible and ready for analytics!');
  } catch (error) {
    console.error('❌ Collection access test failed:', error.message);
  }

  process.exit(0);
}

// Run the setup
setupAnalyticsCollections().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
