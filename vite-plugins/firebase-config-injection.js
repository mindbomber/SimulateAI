/**
 * Vite plugin to inject Firebase configuration into service worker
 * This replaces placeholders with actual environment variables during build
 */
export function injectFirebaseConfigPlugin() {
  return {
    name: 'inject-firebase-config',
    generateBundle(options, bundle) {
      // Find the service worker file
      const swFileName = 'firebase-messaging-sw.js';
      const swFile = bundle[swFileName];
      
      if (swFile && swFile.type === 'asset') {
        // Replace placeholders with environment variables
        let content = swFile.source.toString();
        
        content = content
          .replace('FIREBASE_API_KEY_PLACEHOLDER', process.env.VITE_FIREBASE_API_KEY || '')
          .replace('FIREBASE_AUTH_DOMAIN_PLACEHOLDER', process.env.VITE_FIREBASE_AUTH_DOMAIN || '')
          .replace('FIREBASE_PROJECT_ID_PLACEHOLDER', process.env.VITE_FIREBASE_PROJECT_ID || '')
          .replace('FIREBASE_STORAGE_BUCKET_PLACEHOLDER', process.env.VITE_FIREBASE_STORAGE_BUCKET || '')
          .replace('FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')
          .replace('FIREBASE_APP_ID_PLACEHOLDER', process.env.VITE_FIREBASE_APP_ID || '')
          .replace('FIREBASE_MEASUREMENT_ID_PLACEHOLDER', process.env.VITE_FIREBASE_MEASUREMENT_ID || '');
        
        swFile.source = content;
      }
    }
  };
}
