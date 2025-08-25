@echo off
echo 🔨 Building the project...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo 📦 Build completed successfully!
echo 🚀 Deploying to GitHub Pages...

REM Check if gh-pages branch exists
git show-ref --verify --quiet refs/heads/gh-pages
if %ERRORLEVEL% neq 0 (
    echo 🌱 Creating gh-pages branch...
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main
) else (
    echo ✅ gh-pages branch exists
)

REM Switch to gh-pages and copy files
git checkout gh-pages
git rm -rf .
git clean -fxd
xcopy dist\* . /E /Y
echo. > .nojekyll

REM Add and commit
git add .
git commit -m "Deploy from dist folder - %date% %time%"

REM Push to GitHub
git push origin gh-pages

REM Return to main branch
git checkout main

echo ✅ Deployment completed! Your site should be available at:
echo https://mindbomber.github.io/SimulateAI/
