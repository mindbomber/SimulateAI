#!/usr/bin/env pwsh
# PowerShell script to replace console statements with logger calls

$filePath = "src\js\objects\layout-components.js"

# Read the file content
$content = Get-Content $filePath -Raw

# Add logger import at the top if not already present
if ($content -notmatch "import.*logger") {
    # Insert import at the very beginning
    $content = "import { logger } from '../utils/logger.js';`r`n`r`n" + $content
}

# Replace console.log with logger.debug
$content = $content -replace 'console\.log\(', 'logger.debug('

# Replace console.error with logger.error
$content = $content -replace 'console\.error\(', 'logger.error('

# Replace console.warn with logger.warn
$content = $content -replace 'console\.warn\(', 'logger.warn('

# Replace console.info with logger.info
$content = $content -replace 'console\.info\(', 'logger.info('

# Write the content back to the file
Set-Content $filePath $content -NoNewline

Write-Host "Replaced console statements in $filePath"
