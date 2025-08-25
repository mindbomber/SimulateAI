# Firestore Structure Implementation Guide

## Overview

This document demonstrates how to implement the UID-based Firestore structure that aligns with our
authentication and UID normalization systems.

## Structure Blueprint

```
🔹 Users Collection with UID-based Documents
users/
  └── {uid} (document)
       ├── displayName: "Armando"
       ├── role: "educator"
       ├── email: "armando@example.com"
       ├── createdAt: Timestamp
       ├── updatedAt: Timestamp
       ├── preferences: {}
       └── profile: {
            ├── avatar: "url"
            ├── bio: "text"
            └── customization: {}
          }

🔹 User Subcollections (optional but powerful)
users/{uid}/
  ├── simulations/
  │   └── {simulationId}
  │        ├── completedAt: Timestamp
  │        ├── score: number
  │        ├── choices: []
  │        └── feedback: string
  │
  ├── progress/
  │   └── {categoryId}
  │        ├── completedSimulations: number
  │        ├── averageScore: number
  │        ├── lastActivity: Timestamp
  │        └── achievements: []
  │
  ├── badges/
  │   └── {badgeId}
  │        ├── earnedAt: Timestamp
  │        ├── criteria: string
  │        ├── isVisible: boolean
  │        └── isSelectedFlair: boolean
  │
  └── sessions/
      └── {sessionId}
           ├── startTime: Timestamp
           ├── endTime: Timestamp
           ├── actionsCount: number
           └── metadata: {}
```

## Implementation Code Examples

### 1. Creating User Document (with UID Normalizer)

```javascript
// In your AuthService or FirebaseService
async createUserDocument(userData = {}) {
  try {
    // Use centralized UID from normalizer
    const uid = this.uidNormalizer.requireUID('user document creation');

    // Create document path using normalizer
    const userDocPath = this.uidNormalizer.createUserDocPath('users');

    // Create standardized user data
    const userDoc = this.uidNormalizer.createUserDataObject({
      displayName: userData.displayName || '',
      role: userData.role || 'learner',
      email: userData.email || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        notifications: true,
        publicProfile: false,
        dataSharing: true
      },
      profile: {
        avatar: userData.avatar || '',
        bio: '',
        customization: {}
      }
    });

    // Write to Firestore
    await this.db.doc(userDocPath).set(userDoc);

    return { success: true, uid, path: userDocPath };
  } catch (error) {
    console.error('Failed to create user document:', error);
    return { success: false, error: error.message };
  }
}
```

### 2. Reading User Data

```javascript
async getUserData(uid = null) {
  try {
    const validUID = this.uidNormalizer.getValidatedUID(uid);
    const userDocPath = this.uidNormalizer.createUserDocPath('users', validUID);

    const doc = await this.db.doc(userDocPath).get();

    if (doc.exists) {
      return { success: true, data: doc.data() };
    } else {
      return { success: false, error: 'User document not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 3. Creating Subcollection Data

```javascript
async saveSimulationProgress(simulationId, progressData) {
  try {
    const uid = this.uidNormalizer.requireUID('simulation progress save');

    // Create subcollection path
    const progressPath = `users/${uid}/simulations/${simulationId}`;

    const progressDoc = {
      ...progressData,
      uid, // Include UID for consistency
      completedAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.doc(progressPath).set(progressDoc, { merge: true });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 4. Querying User's Subcollections

```javascript
async getUserSimulations(uid = null) {
  try {
    const validUID = this.uidNormalizer.getValidatedUID(uid);

    const simulationsRef = this.db.collection(`users/${validUID}/simulations`);
    const snapshot = await simulationsRef.orderBy('completedAt', 'desc').get();

    const simulations = [];
    snapshot.forEach(doc => {
      simulations.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, simulations };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Main user documents
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      // All user subcollections
      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }

    // Global collections (if needed)
    match /simulations/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      resource.data.createdBy == request.auth.uid;
    }
  }
}
```

## Benefits of This Structure

### ✅ **Performance**

- Direct document access using UID (no queries needed)
- Subcollections enable efficient pagination
- Built-in Firebase optimization for user-specific data

### ✅ **Security**

- Perfect alignment with Firebase Auth
- Clean security rules using `request.auth.uid`
- No data leakage between users

### ✅ **Scalability**

- Subcollections scale independently
- No document size limits (subcollections vs arrays)
- Efficient for analytics and reporting

### ✅ **Developer Experience**

- Intuitive path structure
- Consistent with authentication patterns
- Easy to debug and monitor

### ✅ **UID Normalization Integration**

- Works seamlessly with our UID normalizer
- Consistent UID usage across all operations
- Built-in validation and error handling

## Migration Strategy (if needed)

If you have existing data structures, here's how to migrate:

```javascript
async migrateToUIDStructure() {
  try {
    // 1. Read existing user data
    const usersSnapshot = await this.db.collection('users').get();

    // 2. For each user document
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = userData.uid || userData.authUID;

      if (uid && this.uidNormalizer.isValidUID(uid)) {
        // 3. Create new UID-based document
        const newPath = this.uidNormalizer.createUserDocPath('users', uid);
        await this.db.doc(newPath).set(userData);

        // 4. Delete old document (if different)
        if (doc.id !== uid) {
          await doc.ref.delete();
        }
      }
    }

    console.log('✅ Migration to UID structure completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}
```

## Analytics Integration

Your structure enables powerful analytics:

```javascript
// Track user events with consistent UID
trackUserEvent(eventName, eventData = {}) {
  const uid = this.uidNormalizer.getAnalyticsUID();

  this.analytics.logEvent(eventName, {
    user_id: uid,  // Consistent with Firestore structure
    ...eventData
  });
}
```

This structure is production-ready and scales beautifully with your authentication system!
