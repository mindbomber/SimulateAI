# reCAPTCHA Domain Configuration Helper for SimulateAI
# This script helps you configure reCAPTCHA domains and test the setup

Write-Host "reCAPTCHA Domain Configuration Helper" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Site Key Information
$siteKey = "6LcuUpsrAAAAAEzAeX1qx0cjShEt7Nf0f73rvLjf"
$adminUrl = "https://www.google.com/recaptcha/admin/site/$siteKey"

Write-Host "Site Key: " -NoNewline -ForegroundColor Yellow
Write-Host $siteKey -ForegroundColor White
Write-Host ""

# Required Domains
Write-Host "Domains to Add to reCAPTCHA Configuration:" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

$domains = @(
    "simulateai.io",
    "www.simulateai.io", 
    "simulateai-research.firebaseapp.com",
    "simulateai-research.web.app",
    "localhost",
    "127.0.0.1"
)

foreach ($domain in $domains) {
    Write-Host "* $domain" -ForegroundColor White
}

Write-Host ""
Write-Host "Configuration URL:" -ForegroundColor Yellow
Write-Host $adminUrl -ForegroundColor Cyan
Write-Host ""

# Offer to open the configuration page
$openBrowser = Read-Host "Open reCAPTCHA Admin Console in browser? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Write-Host "Opening reCAPTCHA Admin Console..." -ForegroundColor Green
    Start-Process $adminUrl
}

Write-Host ""
Write-Host "Configuration Steps:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "1. Open the reCAPTCHA Admin Console (link above)" -ForegroundColor White
Write-Host "2. Find your site with key: $siteKey" -ForegroundColor White
Write-Host "3. Click 'Settings' or 'Domains' section" -ForegroundColor White
Write-Host "4. Add each domain from the list above" -ForegroundColor White
Write-Host "5. Save changes" -ForegroundColor White
Write-Host "6. Wait 5-10 minutes for changes to propagate" -ForegroundColor White
Write-Host "7. Test using the domain test page" -ForegroundColor White
Write-Host ""

# Test File Information
$testFile = "recaptcha-domain-test.html"
Write-Host ""
Write-Host "Testing Your Configuration:" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow
Write-Host "Test file created: $testFile" -ForegroundColor White
Write-Host ""

# Offer to open test file
$openTest = Read-Host "Open domain test page in browser? (y/n)"
if ($openTest -eq "y" -or $openTest -eq "Y") {
    $testPath = Join-Path $PWD $testFile
    if (Test-Path $testPath) {
        Write-Host "Opening domain test page..." -ForegroundColor Green
        Start-Process $testPath
    } else {
        Write-Host "ERROR: Test file not found: $testPath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
Write-Host "Domain not authorized error:" -ForegroundColor Red
Write-Host "   * Add your current domain to reCAPTCHA admin console" -ForegroundColor White
Write-Host "   * Wait 5-10 minutes for DNS propagation" -ForegroundColor White
Write-Host ""
Write-Host "Configuration not working:" -ForegroundColor Red
Write-Host "   * Clear browser cache and cookies" -ForegroundColor White
Write-Host "   * Try incognito/private browsing mode" -ForegroundColor White
Write-Host "   * Verify domain spelling in reCAPTCHA console" -ForegroundColor White
Write-Host ""
Write-Host "HTTPS issues:" -ForegroundColor Red
Write-Host "   * reCAPTCHA requires HTTPS in production" -ForegroundColor White
Write-Host "   * localhost works with HTTP for development" -ForegroundColor White
Write-Host ""

Write-Host "Configuration Complete!" -ForegroundColor Green
Write-Host "After adding domains, test with: recaptcha-domain-test.html" -ForegroundColor Cyan
Write-Host ""

# Current Environment Check
Write-Host "Current Environment:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "Computer: $env:COMPUTERNAME" -ForegroundColor White
Write-Host "User: $env:USERNAME" -ForegroundColor White
Write-Host "Directory: $PWD" -ForegroundColor White
Write-Host ""

# Firebase Project Info
Write-Host "Firebase Project Info:" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow
Write-Host "Project ID: simulateai-research" -ForegroundColor White
Write-Host "Auth Domain: simulateai-research.firebaseapp.com" -ForegroundColor White
Write-Host "reCAPTCHA Key: $siteKey" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "===========" -ForegroundColor Green
Write-Host "1. Configure domains in reCAPTCHA admin console" -ForegroundColor White
Write-Host "2. Wait for propagation (5-10 minutes)" -ForegroundColor White
Write-Host "3. Test with recaptcha-domain-test.html" -ForegroundColor White
Write-Host "4. Test Google OAuth authentication" -ForegroundColor White
Write-Host "5. Run debug-auth-issues.js in browser console if needed" -ForegroundColor White
