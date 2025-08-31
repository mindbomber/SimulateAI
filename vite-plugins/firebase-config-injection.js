import fs from "fs";
import path from "path";

/**
 * Vite plugin to inject Firebase configuration into service worker
 * This replaces placeholders with actual environment variables during build
 */
export function injectFirebaseConfigPlugin() {
  return {
    name: "inject-firebase-config",
    writeBundle(options) {
      // Find the service worker file after build
      const swPath = path.join(options.dir, "firebase-messaging-sw.js");

      if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, "utf8");

        // Replace placeholders with environment variables
        content = content
          .replace(
            /FIREBASE_API_KEY_PLACEHOLDER/g,
            process.env.VITE_FIREBASE_API_KEY || "",
          )
          .replace(
            /FIREBASE_AUTH_DOMAIN_PLACEHOLDER/g,
            process.env.VITE_FIREBASE_AUTH_DOMAIN || "",
          )
          .replace(
            /FIREBASE_PROJECT_ID_PLACEHOLDER/g,
            process.env.VITE_FIREBASE_PROJECT_ID || "",
          )
          .replace(
            /FIREBASE_STORAGE_BUCKET_PLACEHOLDER/g,
            process.env.VITE_FIREBASE_STORAGE_BUCKET || "",
          )
          .replace(
            /FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER/g,
            process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
          )
          .replace(
            /FIREBASE_APP_ID_PLACEHOLDER/g,
            process.env.VITE_FIREBASE_APP_ID || "",
          )
          .replace(
            /FIREBASE_MEASUREMENT_ID_PLACEHOLDER/g,
            process.env.VITE_FIREBASE_MEASUREMENT_ID || "",
          );

        fs.writeFileSync(swPath, content);
        console.log("✅ Firebase config injected into service worker");
      }
    },
  };
}
