# Comprehensive Console.log Cleanup Script
param(
    [string]$TargetDirectory = "src/js",
    [switch]$DryRun = $false
)

Write-Host "🧹 Starting comprehensive console.log cleanup..." -ForegroundColor Green
Write-Host "Target Directory: $TargetDirectory" -ForegroundColor Yellow

# Get all JavaScript files
$jsFiles = Get-ChildItem -Path $TargetDirectory -Filter "*.js" -Recurse

$totalFiles = $jsFiles.Count
$filesProcessed = 0
$totalConsoleLogsRemoved = 0

foreach ($file in $jsFiles) {
    $filesProcessed++
    $progressPercent = [math]::Round(($filesProcessed / $totalFiles) * 100, 1)
    
    Write-Progress -Activity "Processing JavaScript files" -Status "Processing $($file.Name)" -PercentComplete $progressPercent
    
    # Skip certain files that might need console.log for debugging
    if ($file.Name -match "(test|spec|debug|config-test)" -and -not $file.Name.Contains("shared-navigation")) {
        Write-Host "⏭️  Skipping test/debug file: $($file.Name)" -ForegroundColor Yellow
        continue
    }
    
    # Read file content
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Count original console.log statements
    $originalCount = ($content | Select-String -Pattern "console\.log" -AllMatches).Matches.Count
    
    if ($originalCount -eq 0) {
        continue
    }
    
    Write-Host "📁 Processing: $($file.Name) ($originalCount console.log statements)" -ForegroundColor Cyan
    
    # Remove various console.log patterns
    # Single line console.log statements
    $content = $content -replace "(?m)^\s*console\.log\([^;]*\);\s*$", ""
    
    # Multi-line console.log statements
    $content = $content -replace "(?s)console\.log\(\s*[^)]*\s*\);?", ""
    
    # Commented console.log statements
    $content = $content -replace "(?m)^\s*//\s*console\.log.*$", ""
    
    # Console.log with template literals
    $content = $content -replace "(?s)console\.log\(`[^`]*`\);?", ""
    
    # Console.log with complex expressions
    $content = $content -replace "(?s)console\.log\([^)]*\);", ""
    
    # Clean up multiple empty lines
    $content = $content -replace "(?m)^\s*$(\r?\n)", "`n"
    $content = $content -replace "(\r?\n){3,}", "`n`n"
    
    # Count remaining console.log statements
    $newCount = ($content | Select-String -Pattern "console\.log" -AllMatches).Matches.Count
    $removed = $originalCount - $newCount
    
    if ($removed -gt 0) {
        if (-not $DryRun) {
            # Write cleaned content back to file
            $content | Set-Content $file.FullName -NoNewline
            Write-Host "✅ Cleaned $($file.Name): Removed $removed console.log statements" -ForegroundColor Green
        } else {
            Write-Host "🔍 [DRY RUN] Would remove $removed console.log statements from $($file.Name)" -ForegroundColor Magenta
        }
        
        $totalConsoleLogsRemoved += $removed
    }
}

Write-Progress -Activity "Processing JavaScript files" -Completed

Write-Host "`n🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "   • Files processed: $filesProcessed" -ForegroundColor White
Write-Host "   • Total console.log statements removed: $totalConsoleLogsRemoved" -ForegroundColor White

if ($DryRun) {
    Write-Host "   • This was a DRY RUN - no files were modified" -ForegroundColor Magenta
    Write-Host "   • Run without -DryRun to apply changes" -ForegroundColor Magenta
}

# Run ESLint to verify cleanup
Write-Host "`n🔍 Running ESLint to verify cleanup..." -ForegroundColor Yellow
try {
    $eslintResult = & npm run lint 2>&1
    $consoleErrors = $eslintResult | Select-String -Pattern "Unexpected console statement"
    
    if ($consoleErrors) {
        Write-Host "⚠️  Still found $($consoleErrors.Count) console.log warnings in ESLint" -ForegroundColor Yellow
    } else {
        Write-Host "✅ ESLint shows no console.log warnings!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not run ESLint verification" -ForegroundColor Yellow
}

Write-Host "`n✨ Dead code cleanup phase 1 complete!" -ForegroundColor Green
