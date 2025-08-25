# 🛡️ SAFE GitHub Pages Redirect Setup

## Quick Solution: Separate Repository (RECOMMENDED)

This approach keeps your main development files completely safe by using a separate repository for GitHub Pages.

### Step-by-Step Setup:

#### 1. Create New GitHub Repository

- Go to GitHub: https://github.com/new
- Repository name: `SimulateAI-redirect` or `SimulateAI-pages`
- Make it public (required for GitHub Pages)
- Initialize with README ✅

#### 2. Clone and Setup Redirect Repository

```bash
# Clone the new redirect repository
git clone https://github.com/mindbomber/SimulateAI-redirect.git
cd SimulateAI-redirect

# Copy redirect files from your main project
cp ../SimulateAI/github-pages-redirect.html index.html
cp ../SimulateAI/_config.yml .
cp ../SimulateAI/.nojekyll .

# Commit and push
git add .
git commit -m "Setup domain redirect to simulateai.io"
git push origin main
```

#### 3. Configure GitHub Pages

1. Go to new repository: `https://github.com/mindbomber/SimulateAI-redirect`
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: "main"
5. Folder: "/ (root)"
6. Save

#### 4. Update GitHub Pages URL

- Your redirect will be live at: `https://mindbomber.github.io/SimulateAI-redirect/`
- **Important**: Update any existing links that point to the old GitHub Pages URL

### Benefits of This Approach:

✅ **Zero Risk**: Your main `index.html` stays completely safe
✅ **No Conflicts**: Separate repositories prevent any file conflicts
✅ **Easy Management**: Clear separation between development and redirect
✅ **Version Control**: Full git history for both repositories
✅ **Rollback Safety**: Can easily revert redirect without affecting main app

### Your File Structure:

```
Main Repository (development):
SimulateAI/
├── index.html (2165 lines - your app)
├── github-pages-redirect.html (214 lines - redirect template)
├── src/
├── styles/
└── ...all your files

Redirect Repository (GitHub Pages):
SimulateAI-redirect/
├── index.html (214 lines - redirect only)
├── _config.yml
└── .nojekyll
```

### Alternative: Branch-Based Approach

If you prefer to keep everything in one repository:

```bash
# Create redirect branch in your main repository
cd /path/to/your/main/SimulateAI/repository
git checkout -b github-pages-redirect

# Add redirect files to this branch only
cp github-pages-redirect.html index.html
cp _config.yml .
cp .nojekyll .

# Commit to redirect branch
git add .
git commit -m "Add GitHub Pages redirect"
git push origin github-pages-redirect

# Switch back to main branch (your app stays safe)
git checkout main
```

Then configure GitHub Pages to use the `github-pages-redirect` branch instead of `main`.

### Protection Commands:

If you want extra protection in your main repository:

```bash
# Add to .gitignore to protect important files
echo "# Protect main application files" >> .gitignore
echo "index.html.backup.*" >> .gitignore
echo "app.html" >> .gitignore

# Create backup of your main index.html
cp index.html index.html.backup.$(date +%Y%m%d)
```

### Testing Your Setup:

1. **Local Test**: Open `github-pages-redirect.html` in browser
2. **Deployment Test**: Wait 5-10 minutes for GitHub Pages to deploy
3. **Redirect Test**: Visit your GitHub Pages URL and verify redirect
4. **Safety Test**: Confirm your main `index.html` is unchanged

Your main SimulateAI application remains completely safe with this approach! 🛡️
