/**
 * Firebase Messaging Service Worker
 * Handles background push notifications for SimulateAI
 *
 * IMPORTANT: This file MUST be served from the root of your domain
 * (e.g., https://your-app.com/firebase-messaging-sw.js) for the browser
 * to register it correctly for push notifications.
 *
 * If your build system outputs to dist/ or build/, ensure this file
 * is copied to the root of that output directory.
 */

/* eslint-env serviceworker */
/* global firebase */
/* eslint-disable no-console */

// Give the service worker access to Firebase SDK.
// Make sure to use the latest version of the Firebase SDK
// by checking the Firebase documentation.
importScripts(
  'https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js'
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase configuration.
// Your web app's Firebase configuration (same as in your main app)
const firebaseConfig = {
  apiKey: 'AIzaSyAwoc3L-43aXyNjNB9ncGbFm7eE-yn5bFA',
  authDomain: 'simulateai-research.firebaseapp.com',
  projectId: 'simulateai-research',
  storageBucket: 'simulateai-research.firebasestorage.app',
  messagingSenderId: '52924445915', // IMPORTANT
  appId: '1:52924445915:web:dadca1a93bc382403a08fe',
  measurementId: 'G-XW8H062BMV',
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/src/assets/icons/logo.svg', // SimulateAI logo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);

  const { action, notification } = event;
  const { data } = notification;

  event.notification.close();

  if (action === 'dismiss') {
    // Just close the notification
    return;
  }

  // Default action or 'view' action
  const urlToOpen = data.url || '/';

  // Open the URL in existing tab or new tab
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if there's already a tab open with this URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // If no tab found, open new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }

      return null;
    })
  );

  // Send analytics event
  if (data.type) {
    self.postMessage({
      type: 'notification-clicked',
      notificationType: data.type,
      threadId: data.threadId,
      messageId: data.messageId,
    });
  }
});

// Handle notification close events
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event);

  const { notification } = event;
  const { data } = notification;

  // Send analytics event
  if (data.type) {
    self.postMessage({
      type: 'notification-dismissed',
      notificationType: data.type,
      threadId: data.threadId,
      messageId: data.messageId,
    });
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Install event
self.addEventListener('install', _event => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  event.waitUntil(clients.claim());
});
