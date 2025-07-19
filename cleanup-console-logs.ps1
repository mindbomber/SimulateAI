# Console.log Cleanup Script for shared-navigation.js
$inputFile = "src\js\components\shared-navigation.js"
$outputFile = "src\js\components\shared-navigation-cleaned.js"

Write-Host "Starting console.log cleanup for $inputFile"

# Read all content
$content = Get-Content $inputFile -Raw

# Remove single-line console.log statements
$content = $content -replace "(?m)^\s*console\.log\([^;]*\);\s*$", ""

# Remove multi-line console.log statements (basic pattern)
$content = $content -replace "(?s)console\.log\([^)]*\);?", ""

# Remove commented console.log lines
$content = $content -replace "(?m)^\s*//\s*console\.log.*$", ""

# Remove empty lines that might be left
$content = $content -replace "(?m)^\s*$\r?\n", "`n"

# Write cleaned content
$content | Set-Content $outputFile -NoNewline

Write-Host "Cleanup complete. Output saved to $outputFile"

# Count remaining console.log statements
$remaining = (Select-String -Path $outputFile -Pattern "console\.log" -AllMatches).Count
Write-Host "Remaining console.log statements: $remaining"
