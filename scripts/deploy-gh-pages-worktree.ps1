param([switch]$KeepWorktree)
$ErrorActionPreference = 'Stop'

# Move to repo root
Set-Location -Path (Resolve-Path "$PSScriptRoot\..")

Write-Host "🚀 Deploying to GitHub Pages (gh-pages) via git worktree..." -ForegroundColor Cyan

# Verify build output exists
if (-not (Test-Path "dist/index.html") -or -not (Test-Path "dist/app.html")) {
  Write-Host "✖ dist not found or missing index/app.html. Run 'npm run build' first." -ForegroundColor Red
  exit 1
}

# Ensure we have a remote named origin
$originUrl = git remote get-url origin 2>$null
if (-not $originUrl) {
  Write-Host "✖ No 'origin' remote found. Add a GitHub remote and retry." -ForegroundColor Red
  exit 1
}
Write-Host "Origin: $originUrl" -ForegroundColor DarkGray

# Prepare worktree path
$worktreePath = Join-Path (Get-Location) "out/gh-pages"
if (Test-Path $worktreePath) {
  try { git worktree remove -f "$worktreePath" } catch { }
  try { Remove-Item -Recurse -Force "$worktreePath" } catch { }
}
New-Item -ItemType Directory -Path "$worktreePath" -Force | Out-Null

# Ensure local branch matches remote if exists
$branchExists = $false
try {
  git ls-remote --exit-code --heads origin gh-pages | Out-Null
  $branchExists = $true
} catch { $branchExists = $false }

if ($branchExists) {
  git fetch origin gh-pages:gh-pages
  git worktree add "$worktreePath" gh-pages
} else {
  git worktree add -b gh-pages "$worktreePath"
}

# Clean worktree contents (except .git)
Get-ChildItem -LiteralPath "$worktreePath" -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object {
  Remove-Item -Recurse -Force $_.FullName
}

# Copy build output
Copy-Item -Path "dist/*" -Destination "$worktreePath" -Recurse -Force
New-Item -ItemType File -Path (Join-Path "$worktreePath" ".nojekyll") -Force | Out-Null

# Commit and push
Push-Location "$worktreePath"
git add .
$ts = Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"
try {
  git commit -m "Deploy from dist - $ts" | Out-Null
} catch {
  Write-Host "ℹ Nothing to commit (no changes)." -ForegroundColor Yellow
}
git push origin gh-pages
Pop-Location

if (-not $KeepWorktree) {
  git worktree remove -f "$worktreePath"
}

Write-Host "✅ Deployed to gh-pages. URL: https://mindbomber.github.io/SimulateAI/" -ForegroundColor Green
