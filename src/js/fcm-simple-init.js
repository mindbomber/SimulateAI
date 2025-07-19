/**
 * Firebase Cloud Messaging Integration
 * Following the recommended Firebase documentation pattern
 *
 * This goes in your main app's JS/TS file (e.g., App.js, index.ts)
 * after you've initialized Firebase.
 */

// Import Firebase messaging functions
import {
  getMessaging,
  getToken,
  onMessage,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAwoc3L-43aXyNjNB9ncGbFm7eE-yn5bFA',
  authDomain: 'simulateai-research.firebaseapp.com',
  projectId: 'simulateai-research',
  storageBucket: 'simulateai-research.firebasestorage.app',
  messagingSenderId: '52924445915',
  appId: '1:52924445915:web:dadca1a93bc382403a08fe',
  measurementId: 'G-XW8H062BMV',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 1. Register the service worker
navigator.serviceWorker
  .register('/firebase-messaging-sw.js')
  .then(registration => {

    // You can optionally pass the service worker registration to getMessaging
    // const messaging = getMessaging(app, { serviceWorkerRegistration: registration });
  })
  .catch(err => {
    console.error('Service Worker registration failed:', err);
  });

// 2. Request permission and get the token
const VAPID_KEY =
  'BHxifT5EzYByOc7gGI_Iq_W-DHTs4kM823Z38-942vfdX59LZW_0rdwXT6rzNeKC6knJkIJdLvDg0LTavQESnsc'; // Your actual VAPID public key

getToken(messaging, { vapidKey: VAPID_KEY })
  .then(currentToken => {
    if (currentToken) {

      // TODO: Send this token to your server!
      // You'll need to store this token in your database (e.g., Cloud Firestore, or a custom server)
      // so you can send messages to this specific user/device later.
    } else {
      // Show UI to ask user to enable notifications

      // You might want to display a UI element that explains why you need notification permissions
      // and prompts the user to grant them.
    }
  })
  .catch(err => {
    console.error('An error occurred while retrieving token:', err);
    // Handle the error. For example, the user might have blocked notifications.
    if (Notification.permission === 'denied') {
      console.warn('Notifications blocked by the user.');
    }
  });

// 3. Handle foreground messages
onMessage(messaging, payload => {

  // Customize how you want to display the message in the foreground
  // For example, you could show a custom in-app notification or a toast message.
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/src/assets/icons/logo.svg', // SimulateAI logo
  };
  // Display the notification using the browser's Notification API
  new Notification(notificationTitle, notificationOptions);
});

// Export the messaging instance for use in other parts of your app
export { messaging, app };
