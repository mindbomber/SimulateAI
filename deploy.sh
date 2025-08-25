#!/bin/bash

# Deploy script for GitHub Pages
# This script builds the project and deploys it to the gh-pages branch

echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📦 Build completed successfully!"

echo "🚀 Deploying to GitHub Pages..."

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "✅ gh-pages branch exists"
else
    echo "🌱 Creating gh-pages branch..."
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main
fi

# Copy dist contents to gh-pages branch
git checkout gh-pages
git rm -rf .
git clean -fxd
cp -r dist/* .
cp dist/.* . 2>/dev/null || true

# Add a .nojekyll file to bypass Jekyll processing
touch .nojekyll

# Add and commit all files
git add .
git commit -m "Deploy from dist folder - $(date)"

# Push to GitHub
git push origin gh-pages

# Return to main branch
git checkout main

echo "✅ Deployment completed! Your site should be available at:"
echo "https://mindbomber.github.io/SimulateAI/"
