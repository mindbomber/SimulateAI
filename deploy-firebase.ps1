#!/usr/bin/env pwsh
# Firebase Hosting Secure Deployment Script
# Deploys SimulateAI to Firebase Hosting with automatic config injection

# Ensure we run from the script's directory (workspace root)
Set-Location -Path $PSScriptRoot

Write-Host "🔥 Firebase Hosting Deployment - SimulateAI" -ForegroundColor Cyan
Write-Host "🌐 Custom Domain: simulateai.io" -ForegroundColor Green
Write-Host ""

# Step 1: Build the application
Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Verify critical files exist in dist
Write-Host "🔍 Verifying build output..." -ForegroundColor Yellow
$criticalFiles = @(
    "dist/index.html",
    "dist/app.html",
    "dist/sw.js"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MISSING!" -ForegroundColor Red
        exit 1
    }
}

# Allow hashed or nested manifest files produced by Vite
$manifestPath = Get-ChildItem -Path "dist" -Recurse -Include "manifest*.json","*.webmanifest" -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty FullName

if ($manifestPath) {
    Write-Host "✅ Manifest found: $manifestPath" -ForegroundColor Green
} else {
    Write-Host "❌ Manifest file not found in dist (expected manifest*.json or *.webmanifest)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Deploy to Firebase Hosting
Write-Host "🚀 Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your app is now live at:" -ForegroundColor Cyan
    Write-Host "   https://simulateai.io" -ForegroundColor White
    Write-Host "   https://your-project.web.app" -ForegroundColor White
    Write-Host ""
    Write-Host "🔒 Firebase config is automatically injected securely" -ForegroundColor Green
    Write-Host "📊 No credentials exposed in static files" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Test these URLs after deployment:" -ForegroundColor Yellow
    Write-Host "   https://simulateai.io/" -ForegroundColor White
    Write-Host "   https://simulateai.io/app.html" -ForegroundColor White
    Write-Host "   https://simulateai.io/__/firebase/init.json" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check Firebase CLI authentication and project settings" -ForegroundColor Yellow
    exit 1
}
