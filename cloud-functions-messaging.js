/**
 * Cloud Functions for Firebase Cloud Messaging
 * Handles push notifications for SimulateAI forum and blog
 *
 * Deploy with: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Send notification when a new reply is posted to a thread
 */
exports.sendReplyNotification = functions.firestore
  .document('threads/{threadId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    try {
      const { threadId, messageId } = context.params;
      const messageData = snapshot.data();
      const { authorUID, content, replyTo } = messageData;

      // Get thread data
      const threadDoc = await db.doc(`threads/${threadId}`).get();
      if (!threadDoc.exists) {
        console.log('Thread not found');
        return null;
      }

      const threadData = threadDoc.data();
      const { title, subscriberUIDs = [] } = threadData;

      // Get message author info
      const authorDoc = await db.doc(`users/${authorUID}`).get();
      const authorName = authorDoc.exists
        ? authorDoc.data().displayName || authorDoc.data().email || 'Anonymous'
        : 'Anonymous';

      // Determine notification recipients
      let recipients = [...subscriberUIDs];

      // If it's a reply, also notify the original message author
      if (
        replyTo &&
        replyTo.authorUID &&
        !recipients.includes(replyTo.authorUID)
      ) {
        recipients.push(replyTo.authorUID);
      }

      // Don't notify the message author
      recipients = recipients.filter(uid => uid !== authorUID);

      if (recipients.length === 0) {
        console.log('No recipients for notification');
        return null;
      }

      // Get FCM tokens for recipients
      const tokenPromises = recipients.map(async uid => {
        const tokenDoc = await db.doc(`fcm-tokens/${uid}`).get();
        return tokenDoc.exists && tokenDoc.data().isActive
          ? { uid, token: tokenDoc.data().token }
          : null;
      });

      const tokenResults = await Promise.all(tokenPromises);
      const validTokens = tokenResults.filter(result => result !== null);

      if (validTokens.length === 0) {
        console.log('No valid FCM tokens found');
        return null;
      }

      // Create notification payload
      const notification = {
        title: `New reply in "${title}"`,
        body: `${authorName}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
        icon: '/src/assets/icons/logo.svg',
        badge: '/src/assets/icons/favicon.png',
      };

      const data = {
        type: 'reply',
        threadId,
        messageId,
        url: `/forum.html#thread=${threadId}&message=${messageId}`,
        priority: 'normal',
      };

      // Send notifications
      const sendPromises = validTokens.map(async ({ uid, token }) => {
        try {
          await messaging.send({
            token,
            notification,
            data,
            webpush: {
              fcmOptions: {
                link: `${functions.config().app.url}/forum.html#thread=${threadId}`,
              },
            },
          });

          // Log notification in database
          await db.collection('forum-notifications').add({
            recipientUID: uid,
            type: 'reply',
            threadId,
            messageId,
            title: notification.title,
            body: notification.body,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`Notification sent to user: ${uid}`);
        } catch (error) {
          console.error(`Failed to send notification to ${uid}:`, error);

          // Mark token as invalid if error suggests it
          if (error.code === 'messaging/registration-token-not-registered') {
            await db.doc(`fcm-tokens/${uid}`).update({
              isActive: false,
              deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      });

      await Promise.all(sendPromises);
      return null;
    } catch (error) {
      console.error('Error sending reply notification:', error);
      return null;
    }
  });

/**
 * Send notification when a new blog post is published
 */
exports.sendNewPostNotification = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snapshot, context) => {
    try {
      const { postId } = context.params;
      const postData = snapshot.data();
      const { title, excerpt, authorUID, status } = postData;

      // Only send notifications for published posts
      if (status !== 'published') {
        return null;
      }

      // Get author info
      const authorDoc = await db.doc(`users/${authorUID}`).get();
      const authorName = authorDoc.exists
        ? authorDoc.data().displayName || authorDoc.data().email || 'Anonymous'
        : 'Anonymous';

      // Get subscribers to new posts
      const subscriptionsSnapshot = await db
        .collection('notification-subscriptions')
        .where('type', '==', 'new-posts')
        .where('isActive', '==', true)
        .get();

      if (subscriptionsSnapshot.empty) {
        console.log('No subscribers for new posts');
        return null;
      }

      const subscribers = subscriptionsSnapshot.docs.map(
        doc => doc.data().userId
      );

      // Get FCM tokens
      const tokenPromises = subscribers.map(async uid => {
        const tokenDoc = await db.doc(`fcm-tokens/${uid}`).get();
        return tokenDoc.exists && tokenDoc.data().isActive
          ? { uid, token: tokenDoc.data().token }
          : null;
      });

      const tokenResults = await Promise.all(tokenPromises);
      const validTokens = tokenResults.filter(result => result !== null);

      if (validTokens.length === 0) {
        console.log('No valid FCM tokens for new post notification');
        return null;
      }

      // Create notification payload
      const notification = {
        title: 'New Blog Post Published',
        body: `${authorName} published: "${title}"`,
        icon: '/src/assets/icons/logo.svg',
        badge: '/src/assets/icons/favicon.png',
      };

      const data = {
        type: 'new-post',
        postId,
        url: `/blog.html#post=${postId}`,
        priority: 'normal',
      };

      // Send notifications
      const sendPromises = validTokens.map(async ({ uid, token }) => {
        try {
          await messaging.send({
            token,
            notification,
            data,
            webpush: {
              fcmOptions: {
                link: `${functions.config().app.url}/blog.html#post=${postId}`,
              },
            },
          });

          // Log notification
          await db.collection('notifications').add({
            recipientUID: uid,
            type: 'new-post',
            postId,
            title: notification.title,
            body: notification.body,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`New post notification sent to: ${uid}`);
        } catch (error) {
          console.error(
            `Failed to send new post notification to ${uid}:`,
            error
          );
        }
      });

      await Promise.all(sendPromises);
      return null;
    } catch (error) {
      console.error('Error sending new post notification:', error);
      return null;
    }
  });

/**
 * Send notification when a user is mentioned in a message
 */
exports.sendMentionNotification = functions.firestore
  .document('threads/{threadId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    try {
      const { threadId, messageId } = context.params;
      const messageData = snapshot.data();
      const { content, authorUID } = messageData;

      // Extract mentions from content (e.g., @username)
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;

      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
      }

      if (mentions.length === 0) {
        return null;
      }

      // Get thread data
      const threadDoc = await db.doc(`threads/${threadId}`).get();
      if (!threadDoc.exists) return null;

      const { title } = threadDoc.data();

      // Get author info
      const authorDoc = await db.doc(`users/${authorUID}`).get();
      const authorName = authorDoc.exists
        ? authorDoc.data().displayName || authorDoc.data().email || 'Anonymous'
        : 'Anonymous';

      // Find mentioned users by display name or email
      const userPromises = mentions.map(async mention => {
        const usersSnapshot = await db
          .collection('users')
          .where('displayName', '==', mention)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          return usersSnapshot.docs[0].id;
        }

        // Try email match
        const emailSnapshot = await db
          .collection('users')
          .where('email', '==', `${mention}@example.com`) // Adjust based on your mention format
          .limit(1)
          .get();

        return emailSnapshot.empty ? null : emailSnapshot.docs[0].id;
      });

      const mentionedUserIds = (await Promise.all(userPromises)).filter(
        uid => uid !== null && uid !== authorUID
      );

      if (mentionedUserIds.length === 0) {
        return null;
      }

      // Send notifications to mentioned users
      const sendPromises = mentionedUserIds.map(async uid => {
        try {
          const tokenDoc = await db.doc(`fcm-tokens/${uid}`).get();
          if (!tokenDoc.exists || !tokenDoc.data().isActive) {
            return;
          }

          const { token } = tokenDoc.data();

          const notification = {
            title: `You were mentioned in "${title}"`,
            body: `${authorName} mentioned you in a discussion`,
            icon: '/src/assets/icons/logo.svg',
            badge: '/src/assets/icons/favicon.png',
          };

          const data = {
            type: 'mention',
            threadId,
            messageId,
            url: `/forum.html#thread=${threadId}&message=${messageId}`,
            priority: 'high', // Mentions are high priority
          };

          await messaging.send({
            token,
            notification,
            data,
            webpush: {
              fcmOptions: {
                link: `${functions.config().app.url}/forum.html#thread=${threadId}`,
              },
            },
          });

          // Log mention notification
          await db.collection('forum-notifications').add({
            recipientUID: uid,
            type: 'mention',
            threadId,
            messageId,
            title: notification.title,
            body: notification.body,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`Mention notification sent to: ${uid}`);
        } catch (error) {
          console.error(
            `Failed to send mention notification to ${uid}:`,
            error
          );
        }
      });

      await Promise.all(sendPromises);
      return null;
    } catch (error) {
      console.error('Error sending mention notification:', error);
      return null;
    }
  });
