# SimulateAI Deployment Verification Script
# PowerShell script to check if all critical files are accessible

param(
    [string]$Domain = "simulateai.io",
    [string]$Protocol = "https"
)

$CriticalFiles = @(
    "/",
    "/app.html", 
    "/sw.js",
    "/manifest.json",
    "/src/js/config/firebase-config.js",
    "/src/js/data/system-metadata-schema.js",
    "/src/js/data/scenario-creation-dates.js"
)

Write-Host "🔍 Verifying deployment on $Protocol`://$Domain" -ForegroundColor Cyan
Write-Host ""

$Results = @()

foreach ($File in $CriticalFiles) {
    $Url = "$Protocol`://$Domain$File"
    
    try {
        $Response = Invoke-WebRequest -Uri $Url -Method Head -ErrorAction Stop
        $Success = $Response.StatusCode -eq 200
        $Status = $Response.StatusCode
    }
    catch {
        $Success = $false
        $Status = $_.Exception.Response.StatusCode.value__
        if (-not $Status) { $Status = "ERROR" }
    }
    
    $Results += [PSCustomObject]@{
        File = $File
        Url = $Url
        Status = $Status
        Success = $Success
    }
    
    $Icon = if ($Success) { "✅" } else { "❌" }
    Write-Host "$Icon $File ($Status)" -ForegroundColor $(if ($Success) { "Green" } else { "Red" })
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow

$SuccessCount = ($Results | Where-Object { $_.Success }).Count
$TotalCount = $Results.Count

Write-Host "✅ Successful: $SuccessCount/$TotalCount" -ForegroundColor Green
Write-Host "❌ Failed: $($TotalCount - $SuccessCount)/$TotalCount" -ForegroundColor Red

if ($SuccessCount -eq $TotalCount) {
    Write-Host ""
    Write-Host "🎉 All files are accessible! Deployment successful." -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "⚠️  Some files are missing. Check your deployment." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Failed files:" -ForegroundColor Red
    $Results | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  - $($_.Url)" -ForegroundColor Red
    }
}

# Usage examples:
# .\verify-deployment.ps1
# .\verify-deployment.ps1 -Domain "localhost:4173" -Protocol "http"
