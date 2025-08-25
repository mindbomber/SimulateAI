#!/usr/bin/env pwsh
# SEO Analysis Script for SimulateAI

Write-Host "🔍 SEO Analysis for SimulateAI" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

$pages = @(
    @{ url = "https://simulateai.io/"; name = "Homepage" },
    @{ url = "https://simulateai.io/app.html"; name = "App" },
    @{ url = "https://simulateai.io/blog.html"; name = "Blog" },
    @{ url = "https://simulateai.io/about.html"; name = "About" }
)

foreach ($page in $pages) {
    Write-Host "`n📄 Analyzing: $($page.name) ($($page.url))" -ForegroundColor Yellow
    
    try {
        $content = Invoke-WebRequest -Uri $page.url -ErrorAction Stop
        $html = $content.Content
        
        # Title Tag
        if ($html -match '<title[^>]*>([^<]+)</title>') {
            $title = $matches[1].Trim()
            Write-Host "✓ Title: $title" -ForegroundColor Green
            if ($title.Length -gt 60) {
                Write-Host "⚠️  Title too long ($($title.Length) chars) - consider shortening" -ForegroundColor Yellow
            }
        } else {
            Write-Host "✗ Missing title tag" -ForegroundColor Red
        }
        
        # Meta Description
        if ($html -match '<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']') {
            $description = $matches[1].Trim()
            Write-Host "✓ Description: $($description.Substring(0, [Math]::Min(80, $description.Length)))..." -ForegroundColor Green
            if ($description.Length -gt 160) {
                Write-Host "⚠️  Description too long ($($description.Length) chars)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "✗ Missing meta description" -ForegroundColor Red
        }
        
        # H1 Tags
        $h1Matches = [regex]::Matches($html, '<h1[^>]*>([^<]+)</h1>')
        if ($h1Matches.Count -gt 0) {
            Write-Host "✓ H1 tags found: $($h1Matches.Count)" -ForegroundColor Green
            foreach ($h1 in $h1Matches) {
                Write-Host "  - $($h1.Groups[1].Value.Trim())" -ForegroundColor Cyan
            }
        } else {
            Write-Host "✗ No H1 tags found" -ForegroundColor Red
        }
        
        # Canonical URL
        if ($html -match '<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']') {
            Write-Host "✓ Canonical URL: $($matches[1])" -ForegroundColor Green
        } else {
            Write-Host "✗ Missing canonical URL" -ForegroundColor Red
        }
        
        # Open Graph
        $ogMatches = [regex]::Matches($html, '<meta[^>]*property=["\']og:([^"\']+)["\'][^>]*content=["\']([^"\']+)["\']')
        if ($ogMatches.Count -gt 0) {
            Write-Host "✓ Open Graph tags: $($ogMatches.Count)" -ForegroundColor Green
        } else {
            Write-Host "✗ Missing Open Graph tags" -ForegroundColor Red
        }
        
        # Structured Data
        if ($html -match '<script[^>]*type=["\']application/ld\+json["\'][^>]*>') {
            Write-Host "✓ Structured data found" -ForegroundColor Green
        } else {
            Write-Host "✗ No structured data" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "✗ Failed to analyze page: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 SEO Summary:" -ForegroundColor Green
Write-Host "- Check for proper title tags (<60 chars)" 
Write-Host "- Ensure meta descriptions exist (<160 chars)"
Write-Host "- Verify H1 tags are present and descriptive"
Write-Host "- Confirm canonical URLs are set"
Write-Host "- Validate Open Graph tags for social sharing"
Write-Host "- Consider adding more structured data"
