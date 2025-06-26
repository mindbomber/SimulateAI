#!/usr/bin/env pwsh
# PowerShell script to replace console statements with logger calls in canvas-manager.js

$filePath = "src\js\utils\canvas-manager.js"

# Read the file content
$content = Get-Content $filePath -Raw

# Add logger import at the top if not already present
if ($content -notmatch "import.*logger") {
    # Find the first line that starts with class or function and insert import before it
    $content = $content -replace "(class CanvasManager)", "import { logger } from './logger.js';`r`n`r`n`$1"
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
