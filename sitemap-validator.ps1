#!/usr/bin/env pwsh
# Sitemap Validation Script for Google Search Console

Write-Host "🔍 Sitemap Validation for Google Search Console" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

$sitemapUrl = "https://simulateai.io/sitemap.xml"

# Test 1: Basic HTTP Accessibility
Write-Host "`n1. Testing Basic HTTP Accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $sitemapUrl -Method Head -ErrorAction Stop
    Write-Host "✓ HTTP Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Green
    Write-Host "✓ Content-Length: $($response.Headers['Content-Length']) bytes" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to access sitemap: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Googlebot User Agent Test
Write-Host "`n2. Testing Googlebot User Agent..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $sitemapUrl -UserAgent "Googlebot/2.1 (+http://www.google.com/bot.html)" -Method Head -ErrorAction Stop
    Write-Host "✓ Googlebot can access sitemap: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Googlebot cannot access sitemap: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: XML Validation
Write-Host "`n3. Testing XML Structure..." -ForegroundColor Yellow
try {
    $content = Invoke-WebRequest -Uri $sitemapUrl -ErrorAction Stop
    $xml = [xml]$content.Content
    Write-Host "✓ XML is valid and parseable" -ForegroundColor Green
    Write-Host "✓ Namespace: $($xml.urlset.xmlns)" -ForegroundColor Green
    Write-Host "✓ Total URLs: $($xml.urlset.url.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ XML validation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: URL Accessibility Test
Write-Host "`n4. Testing Individual URLs..." -ForegroundColor Yellow
try {
    $xml = [xml](Invoke-WebRequest -Uri $sitemapUrl).Content
    foreach ($url in $xml.urlset.url) {
        try {
            $urlResponse = Invoke-WebRequest -Uri $url.loc -Method Head -TimeoutSec 10 -ErrorAction Stop
            Write-Host "✓ $($url.loc) - Status: $($urlResponse.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "✗ $($url.loc) - Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ Failed to test individual URLs: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: robots.txt Check
Write-Host "`n5. Testing robots.txt Configuration..." -ForegroundColor Yellow
try {
    $robotsResponse = Invoke-WebRequest -Uri "https://simulateai.io/robots.txt" -ErrorAction Stop
    $robotsContent = $robotsResponse.Content
    if ($robotsContent -match "Sitemap:\s*https://simulateai\.io/sitemap\.xml") {
        Write-Host "✓ robots.txt correctly references sitemap" -ForegroundColor Green
    } else {
        Write-Host "✗ robots.txt does not reference correct sitemap" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Failed to access robots.txt: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: SSL/TLS Check
Write-Host "`n6. Testing SSL/TLS Configuration..." -ForegroundColor Yellow
try {
    $sslResponse = Invoke-WebRequest -Uri $sitemapUrl -ErrorAction Stop
    if ($sslResponse.BaseResponse.ResponseUri.Scheme -eq "https") {
        Write-Host "✓ HTTPS is working correctly" -ForegroundColor Green
    } else {
        Write-Host "✗ HTTPS redirect failed" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ SSL/TLS test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Summary:" -ForegroundColor Green
Write-Host "- Sitemap URL: $sitemapUrl"
Write-Host "- All basic tests should pass for Google Search Console"
Write-Host "- If Google still can't fetch, wait 24-48 hours for DNS propagation"
Write-Host "- Submit sitemap in Google Search Console: Search Console > Sitemaps > Add a new sitemap"
