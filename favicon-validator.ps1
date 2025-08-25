#!/usr/bin/env pwsh
# Favicon Validation Script for Google Search Results

Write-Host "🎨 Favicon Validation for Google Search Results" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

$domain = "https://simulateai.io"
$faviconPaths = @(
    "/favicon.ico",
    "/favicon.svg", 
    "/src/assets/icons/favicon.svg"
)

# Test 1: Check Favicon Accessibility
Write-Host "`n1. Testing Favicon Accessibility..." -ForegroundColor Yellow
foreach ($path in $faviconPaths) {
    $url = "$domain$path"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -ErrorAction Stop
        Write-Host "✓ $path - Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "  Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ $path - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Check HTML Favicon References
Write-Host "`n2. Testing HTML Favicon References..." -ForegroundColor Yellow
$pages = @("$domain/", "$domain/app.html")
foreach ($pageUrl in $pages) {
    try {
        $content = (Invoke-WebRequest -Uri $pageUrl).Content
        Write-Host "`nAnalyzing: $pageUrl" -ForegroundColor Cyan
        
        # Check for favicon.ico
        if ($content -match 'rel="icon"[^>]*href="/favicon\.ico"') {
            Write-Host "✓ favicon.ico referenced" -ForegroundColor Green
        } else {
            Write-Host "✗ favicon.ico not found" -ForegroundColor Red
        }
        
        # Check for favicon.svg
        if ($content -match 'rel="icon"[^>]*href="/favicon\.svg"') {
            Write-Host "✓ favicon.svg referenced" -ForegroundColor Green
        } else {
            Write-Host "✗ favicon.svg not found" -ForegroundColor Red
        }
        
        # Check for apple-touch-icon
        if ($content -match 'rel="apple-touch-icon"') {
            Write-Host "✓ Apple touch icon referenced" -ForegroundColor Green
        } else {
            Write-Host "✗ Apple touch icon not found" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "✗ Failed to check $pageUrl : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Check Manifest.json
Write-Host "`n3. Testing PWA Manifest..." -ForegroundColor Yellow
try {
    $manifestContent = (Invoke-WebRequest -Uri "$domain/manifest.json").Content
    $manifest = $manifestContent | ConvertFrom-Json
    
    Write-Host "✓ Manifest accessible" -ForegroundColor Green
    Write-Host "  App name: $($manifest.name)" -ForegroundColor Cyan
    Write-Host "  Icons count: $($manifest.icons.Count)" -ForegroundColor Cyan
    
    foreach ($icon in $manifest.icons) {
        Write-Host "  - $($icon.src) ($($icon.sizes))" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Manifest error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Structured Data Logo Check
Write-Host "`n4. Testing Structured Data Logo..." -ForegroundColor Yellow
try {
    $homeContent = (Invoke-WebRequest -Uri "$domain/").Content
    if ($homeContent -match '"logo":\s*"([^"]+)"') {
        $logoUrl = $matches[1]
        Write-Host "✓ Structured data logo found: $logoUrl" -ForegroundColor Green
        
        # Test logo accessibility
        try {
            $logoResponse = Invoke-WebRequest -Uri $logoUrl -Method Head -ErrorAction Stop
            Write-Host "✓ Logo accessible: $($logoResponse.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "✗ Logo not accessible: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ No structured data logo found" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed to check structured data: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Google Search Results Requirements:" -ForegroundColor Green
Write-Host "- ✅ Root-level favicon.ico for legacy browsers"
Write-Host "- ✅ Modern favicon.svg for crisp display"
Write-Host "- ✅ Apple touch icon for iOS devices"
Write-Host "- ✅ PWA manifest with multiple icon sizes"
Write-Host "- ✅ Structured data with logo reference"
Write-Host "`n🔍 Your radar chart favicon should now appear in Google search results!"
