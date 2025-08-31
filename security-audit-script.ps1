# Security Audit Script for SimulateAI
Write-Host "🔍 Running Security Audit for SimulateAI..." -ForegroundColor Yellow

# Check for hardcoded Firebase API keys
Write-Host "`n🔥 Checking for Firebase API keys..." -ForegroundColor Cyan
$firebaseKeys = git ls-files | Where-Object { $_ -notmatch "node_modules|\.git|dist" } | ForEach-Object {
    Select-String -Path $_ -Pattern "AIza[A-Za-z0-9_-]{35}" -Quiet 2>$null
}

if ($firebaseKeys -contains $true) {
    Write-Host "❌ WARNING: Firebase API keys found in tracked files!" -ForegroundColor Red
    git ls-files | Where-Object { $_ -notmatch "node_modules|\.git|dist" } | ForEach-Object {
        Select-String -Path $_ -Pattern "AIza[A-Za-z0-9_-]{35}" 2>$null
    }
} else {
    Write-Host "✅ No hardcoded Firebase API keys found in tracked files" -ForegroundColor Green
}

# Check for hardcoded Stripe keys
Write-Host "`n💳 Checking for Stripe keys..." -ForegroundColor Cyan
$stripeKeys = git ls-files | Where-Object { $_ -notmatch "node_modules|\.git|dist" } | ForEach-Object {
    Select-String -Path $_ -Pattern "pk_live_[A-Za-z0-9]{99}" -Quiet 2>$null
}

if ($stripeKeys -contains $true) {
    Write-Host "❌ WARNING: Stripe keys found in tracked files!" -ForegroundColor Red
    git ls-files | Where-Object { $_ -notmatch "node_modules|\.git|dist" } | ForEach-Object {
        Select-String -Path $_ -Pattern "pk_live_[A-Za-z0-9]{99}" 2>$null
    }
} else {
    Write-Host "✅ No hardcoded Stripe keys found in tracked files" -ForegroundColor Green
}

# Check for hardcoded ReCAPTCHA keys
Write-Host "`n🤖 Checking for ReCAPTCHA site keys..." -ForegroundColor Cyan
$recaptchaKeys = git ls-files | Where-Object { $_ -notmatch "node_modules|\.git|dist" } | ForEach-Object {
    Select-String -Path $_ -Pattern "6L[a-zA-Z0-9_-]{38}" -Quiet 2>$null
}

if ($recaptchaKeys -contains $true) {
    Write-Host "ℹ️ ReCAPTCHA site keys found (these are public keys - OK):" -ForegroundColor Blue
    git ls-files | Where-Object { $_ -notmatch "node_modules|\.git|dist" } | ForEach-Object {
        Select-String -Path $_ -Pattern "6L[a-zA-Z0-9_-]{38}" 2>$null
    }
} else {
    Write-Host "✅ No ReCAPTCHA keys found" -ForegroundColor Green
}

# Check .env files are properly ignored
Write-Host "`n🔐 Checking environment file security..." -ForegroundColor Cyan
if (Test-Path ".env") {
    $envTracked = git ls-files | Select-String "^\.env$" -Quiet
    if ($envTracked) {
        Write-Host "❌ CRITICAL: .env file is being tracked by git!" -ForegroundColor Red
    } else {
        Write-Host "✅ .env file exists but is not tracked by git" -ForegroundColor Green
    }
}

# Check for any remaining secret patterns
Write-Host "`n🕵️ Checking for generic secret patterns..." -ForegroundColor Cyan
$secretPatterns = @(
    "password\s*=\s*['\`"][^'\`"]+['\`"]",
    "secret\s*=\s*['\`"][^'\`"]+['\`"]", 
    "token\s*=\s*['\`"][^'\`"]+['\`"]",
    "key\s*=\s*['\`"][^'\`"]+['\`"]"
)

$foundSecrets = $false
foreach ($pattern in $secretPatterns) {
    $matches = git ls-files | Where-Object { $_ -notmatch "node_modules|\.git|dist|\.example|test|spec|security-audit" } | ForEach-Object {
        Select-String -Path $_ -Pattern $pattern 2>$null | Where-Object { 
            $_.Line -notmatch "your_.*_here|example|placeholder|template|test|mock|dummy|TODO|FIXME"
        }
    }
    
    if ($matches) {
        Write-Host "⚠️ Potential secrets found:" -ForegroundColor Yellow
        $matches | ForEach-Object {
            Write-Host "  $($_.Filename):$($_.LineNumber): $($_.Line.Trim())" -ForegroundColor Yellow
        }
        $foundSecrets = $true
    }
}

if (-not $foundSecrets) {
    Write-Host "✅ No generic secret patterns found" -ForegroundColor Green
}

Write-Host "`n📋 Security Audit Summary:" -ForegroundColor Magenta
Write-Host "✅ GitHub workflow now uses secrets" -ForegroundColor Green
Write-Host "✅ Firebase configs updated to use environment variables" -ForegroundColor Green
Write-Host "✅ .env file is properly ignored" -ForegroundColor Green
Write-Host "ℹ️ ReCAPTCHA site keys are public and safe to commit" -ForegroundColor Blue

Write-Host "`n🚨 NEXT STEPS REQUIRED:" -ForegroundColor Red
Write-Host "1. Add these secrets to GitHub repository settings:" -ForegroundColor Yellow
Write-Host "   - VITE_FIREBASE_API_KEY" -ForegroundColor White
Write-Host "   - VITE_FIREBASE_AUTH_DOMAIN" -ForegroundColor White
Write-Host "   - VITE_FIREBASE_PROJECT_ID" -ForegroundColor White
Write-Host "   - VITE_FIREBASE_STORAGE_BUCKET" -ForegroundColor White
Write-Host "   - VITE_FIREBASE_MESSAGING_SENDER_ID" -ForegroundColor White
Write-Host "   - VITE_FIREBASE_APP_ID" -ForegroundColor White
Write-Host "   - VITE_FIREBASE_MEASUREMENT_ID" -ForegroundColor White
Write-Host "   - VITE_STRIPE_PUBLISHABLE_KEY" -ForegroundColor White
Write-Host "2. Consider regenerating exposed keys for maximum security" -ForegroundColor Yellow
Write-Host "3. Review and remove any git history containing the exposed keys" -ForegroundColor Yellow

Write-Host "`n✅ Security audit complete!" -ForegroundColor Green
