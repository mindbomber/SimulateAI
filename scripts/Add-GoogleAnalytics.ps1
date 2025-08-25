# Google Analytics Auto-Injection PowerShell Script
# Automatically adds GA4 tracking code to all HTML pages

$GATag = @"
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-4SVB78MBHN"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-4SVB78MBHN');
    </script>
"@

function Add-GATagToFile {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        
        # Check if GA tag already exists
        if ($content -match "googletagmanager\.com/gtag/js\?id=G-4SVB78MBHN") {
            Write-Host "✓ GA tag already exists in: $FilePath" -ForegroundColor Green
            return $false
        }

        # Find the <head> tag and add GA tag after it
        if ($content -match "(<head[^>]*>)") {
            $updatedContent = $content -replace "(<head[^>]*>)", "`$1`n$GATag"
            Set-Content -Path $FilePath -Value $updatedContent -Encoding UTF8
            Write-Host "✓ Added GA tag to: $FilePath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠ No <head> tag found in: $FilePath" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "✗ Error processing $FilePath : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Invoke-GAInjection {
    Write-Host "🔍 Searching for HTML files..." -ForegroundColor Cyan
    
    # Find all HTML files in the current directory and subdirectories
    $htmlFiles = Get-ChildItem -Path "." -Filter "*.html" -Recurse

    Write-Host "📄 Found $($htmlFiles.Count) HTML files" -ForegroundColor Cyan
    
    $processed = 0
    $updated = 0

    foreach ($file in $htmlFiles) {
        $processed++
        if (Add-GATagToFile -FilePath $file.FullName) {
            $updated++
        }
    }

    Write-Host "`n📊 Summary:" -ForegroundColor Cyan
    Write-Host "   Files processed: $processed"
    Write-Host "   Files updated: $updated"
    Write-Host "   Files already had GA: $($processed - $updated)"
    
    if ($updated -gt 0) {
        Write-Host "`n✅ Google Analytics successfully added to $updated HTML files!" -ForegroundColor Green
    } else {
        Write-Host "`n✅ All HTML files already have Google Analytics configured!" -ForegroundColor Green
    }
}

# Run the script
Write-Host "🚀 Starting Google Analytics injection...`n" -ForegroundColor Cyan
Invoke-GAInjection
