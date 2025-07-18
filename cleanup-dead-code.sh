#!/bin/bash
# Dead Code Cleanup Script for SimulateAI
# Run this script to clean up unused and empty files

echo "🧹 Starting Dead Code Cleanup..."

# Step 1: Remove empty files (0 KB)
echo "📁 Removing empty files..."
rm -f cloud-functions-messaging.js
rm -f debug-donations.js
rm -f fix-console.js
rm -f "src/js/components/privacy-navigation.js"
rm -f "src/js/data/simulation-metadata.js"
rm -f "src/js/services/data-connect-service.js"
rm -f "src/js/utils/firebase-diagnostic.js"
rm -f "src/js/utils/simple-firebase-test.js"
rm -f test-security.js

# Step 2: Remove test/debug files not needed in production
echo "🧪 Removing test and debug files..."
rm -f test-enhanced-tracking.js
rm -rf "src/js/debug/"
rm -f "src/js/test/mcp-comprehensive-verification.js"
rm -f "src/js/test/mcp-final-verification.js"
rm -f "src/js/test/simple-mcp-test.js"
rm -f "scripts/security-check.js"

# Step 3: Remove demo files
echo "🎯 Removing demo files..."
rm -rf "src/js/demo/"

# Step 4: Remove unused config files
echo "⚙️ Removing unused config files..."
rm -f "src/js/config/firebase-config-test.js"
rm -f "simulateai/.eslintrc.js"

# Step 5: Remove our analysis script
echo "🔍 Removing analysis script..."
rm -f analyze-dead-code.js

echo "✅ Cleanup complete! Removed empty files, test files, and demo files."
echo "📊 Next steps:"
echo "   1. Review scenario files to determine which are actually needed"
echo "   2. Check if services like enhanced-storage-service are used elsewhere"
echo "   3. Consider removing unused components like scenario-browser"
echo "   4. Run 'npm run lint' to check for any new issues"
