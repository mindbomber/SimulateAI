#!/usr/bin/env node

/**
 * SimulateAI Deployment Verification Script
 * Checks if all critical files are accessible on the deployed domain
 */

const https = require("https");
const http = require("http");

const DOMAIN = "simulateai.io";
const PROTOCOL = "https"; // Change to 'http' if not using HTTPS

const CRITICAL_FILES = [
  "/",
  "/app.html",
  "/sw.js",
  "/manifest.json",
  "/src/js/config/firebase-config.js",
  "/src/js/data/system-metadata-schema.js",
  "/src/js/data/scenario-creation-dates.js",
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const client = PROTOCOL === "https" ? https : http;

    client
      .get(url, (res) => {
        resolve({
          url,
          status: res.statusCode,
          success: res.statusCode === 200,
        });
      })
      .on("error", (err) => {
        resolve({
          url,
          status: "ERROR",
          success: false,
          error: err.message,
        });
      });
  });
}

async function verifyDeployment() {
  console.log(`🔍 Verifying deployment on ${PROTOCOL}://${DOMAIN}\n`);

  const results = [];

  for (const file of CRITICAL_FILES) {
    const url = `${PROTOCOL}://${DOMAIN}${file}`;
    const result = await checkUrl(url);
    results.push(result);

    const status = result.success ? "✅" : "❌";
    const statusCode = result.status;
    console.log(`${status} ${file} (${statusCode})`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log("\n📊 Summary:");
  const successCount = results.filter((r) => r.success).length;
  const totalCount = results.length;

  console.log(`✅ Successful: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);

  if (successCount === totalCount) {
    console.log("\n🎉 All files are accessible! Deployment successful.");
  } else {
    console.log("\n⚠️  Some files are missing. Check your deployment.");
    console.log("\nFailed files:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.url}`);
      });
  }
}

// Run verification
verifyDeployment().catch(console.error);
