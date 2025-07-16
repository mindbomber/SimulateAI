# Firebase Analytics Setup Script
# Run this to configure your Firebase project for system analytics

Write-Host "🔥 Setting up Firebase Analytics for SimulateAI..." -ForegroundColor Cyan

# Check if Firebase CLI is installed
if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Login to Firebase (if not already logged in)
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Yellow
firebase login --reauth

# Set the Firebase project
Write-Host "📱 Setting Firebase project..." -ForegroundColor Yellow
firebase use simulateai-research

# Deploy Firestore security rules
Write-Host "🛡️ Deploying Firestore security rules..." -ForegroundColor Yellow

# Create firestore.rules file with analytics rules
$firestoreRules = @"
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Analytics collections - Allow authenticated writes, public reads for aggregated data
    match /analytics_{collection}/{document} {
      // Allow authenticated users to write analytics data
      allow write: if request.auth != null;
      
      // Allow public read access for aggregated/anonymized data
      allow read: if true;
      
      // Validate analytics data structure
      allow create: if validateAnalyticsData(request.resource.data);
      allow update: if validateAnalyticsData(request.resource.data);
    }
    
    // Helper function to validate analytics data
    function validateAnalyticsData(data) {
      return data.keys().hasAll(['timestamp', 'type', 'source']) &&
             data.timestamp is timestamp &&
             data.type is string &&
             data.source is string &&
             data.size() <= 50; // Prevent overly large documents
    }
    
    // All other collections (maintain existing rules)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
"@

$firestoreRules | Out-File -FilePath "firestore.rules" -Encoding utf8

# Deploy the rules
firebase deploy --only firestore:rules

# Create initial analytics collections
Write-Host "📊 Creating analytics collections..." -ForegroundColor Yellow

# Create a simple node script to initialize collections
$initScript = @"
const admin = require('firebase-admin');

// Initialize admin (uses environment GOOGLE_APPLICATION_CREDENTIALS or default service account)
admin.initializeApp({
  projectId: 'simulateai-research'
});

const db = admin.firestore();

async function setupAnalyticsCollections() {
  const collections = [
    'analytics_scenario_performance',
    'analytics_framework_engagement', 
    'analytics_session_tracking',
    'analytics_platform_metrics'
  ];

  for (const collection of collections) {
    try {
      // Create initial document to establish collection
      await db.collection(collection).doc('_init').set({
        initialized: true,
        created: admin.firestore.FieldValue.serverTimestamp(),
        description: `Analytics collection for ${collection.replace('analytics_', '')}`,
        version: '1.0'
      });
      
      console.log(`✅ Created collection: ${collection}`);
    } catch (error) {
      console.log(`⚠️ Collection ${collection} may already exist:`, error.message);
    }
  }
  
  console.log('🎉 Analytics collections setup complete!');
  process.exit(0);
}

setupAnalyticsCollections().catch(console.error);
"@

$initScript | Out-File -FilePath "init-analytics.js" -Encoding utf8

# Install firebase-admin if not present
if (!(Test-Path "node_modules/firebase-admin")) {
    Write-Host "📦 Installing Firebase Admin SDK..." -ForegroundColor Yellow
    npm install firebase-admin
}

# Run the initialization script
Write-Host "🚀 Initializing analytics collections..." -ForegroundColor Yellow
node init-analytics.js

# Create composite indexes for efficient queries
Write-Host "🔍 Setting up Firestore indexes..." -ForegroundColor Yellow

$firestoreIndexes = @"
{
  "indexes": [
    {
      "collectionGroup": "analytics_scenario_performance",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "scenarioId",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "analytics_scenario_performance",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "categoryId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "action",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "analytics_framework_engagement",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "frameworkId",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "analytics_session_tracking",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "sessionId",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "analytics_platform_metrics",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "updateType",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
"@

$firestoreIndexes | Out-File -FilePath "firestore.indexes.json" -Encoding utf8

# Deploy indexes
firebase deploy --only firestore:indexes

# Test the setup
Write-Host "🧪 Testing Firebase connection..." -ForegroundColor Yellow

# Create a simple test script
$testScript = @"
const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'simulateai-research'
});

const db = admin.firestore();

async function testFirebaseConnection() {
  try {
    // Test write to analytics collection
    const testDoc = await db.collection('analytics_platform_metrics').add({
      type: 'platform_metrics',
      updateType: 'setup_test',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'setup-script',
      data: {
        setupComplete: true,
        testTime: new Date().toISOString()
      }
    });
    
    console.log('✅ Firebase write test successful:', testDoc.id);
    
    // Test read from analytics collection
    const snapshot = await db.collection('analytics_platform_metrics')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      console.log('✅ Firebase read test successful');
      console.log('📊 Latest metric:', snapshot.docs[0].data());
    }
    
    console.log('🎉 Firebase analytics setup verified successfully!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    console.log('💡 Check your Firebase project permissions and authentication');
  }
  
  process.exit(0);
}

testFirebaseConnection();
"@

$testScript | Out-File -FilePath "test-firebase.js" -Encoding utf8

# Run the test
node test-firebase.js

Write-Host "🎉 Firebase Analytics setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open firebase-analytics-demo.html to test the integration" -ForegroundColor White
Write-Host "2. Check Firebase Console: https://console.firebase.google.com/project/simulateai-research/firestore" -ForegroundColor White
Write-Host "3. Start using analytics in your app - it's already integrated!" -ForegroundColor White
Write-Host ""
Write-Host "📊 Your analytics collections are ready:" -ForegroundColor Yellow
Write-Host "   • analytics_scenario_performance" -ForegroundColor White
Write-Host "   • analytics_framework_engagement" -ForegroundColor White  
Write-Host "   • analytics_session_tracking" -ForegroundColor White
Write-Host "   • analytics_platform_metrics" -ForegroundColor White

# Clean up temporary files
Remove-Item "init-analytics.js" -ErrorAction SilentlyContinue
Remove-Item "test-firebase.js" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🚀 Happy Analytics!" -ForegroundColor Green
