# SimulateAI Custom Domain Deployment Checklist

## 🚀 Pre-Deployment Steps

### 1. Build Production

```bash
npm run build
```

### 2. Verify Critical Files in dist/

Ensure these files exist before deploying:

**Essential JavaScript Modules:**

- ✅ `dist/src/js/config/firebase-config.js`
- ✅ `dist/src/js/data/system-metadata-schema.js`
- ✅ `dist/src/js/data/scenario-creation-dates.js`

**Core Files:**

- ✅ `dist/index.html`
- ✅ `dist/app.html`
- ✅ `dist/sw.js` (Service Worker)
- ✅ `dist/manifest.json`
- ✅ `dist/CNAME` (contains: simulateai.io)

### 3. File Verification Commands

```powershell
# Check that essential JS modules exist
Test-Path "dist/src/js/config/firebase-config.js"
Test-Path "dist/src/js/data/system-metadata-schema.js"
Test-Path "dist/src/js/data/scenario-creation-dates.js"

# Verify CNAME file
Get-Content "dist/CNAME"  # Should show: simulateai.io
```

## 📁 What to Upload

Upload **EVERYTHING** from the `dist/` folder to your web server root:

```
dist/
├── index.html                    # Landing page
├── app.html                      # Main application
├── sw.js                         # Service Worker
├── manifest.json                 # PWA manifest
├── CNAME                         # Custom domain config
├── assets/                       # Bundled CSS/JS
│   ├── *.css files
│   ├── *.js files
│   └── *.svg, *.png files
└── src/                          # Static JS modules
    └── js/
        ├── config/
        │   └── firebase-config.js
        └── data/
            ├── system-metadata-schema.js
            └── scenario-creation-dates.js
```

## 🌐 Domain Configuration

### DNS Settings

- **Domain**: simulateai.io
- **Type**: A Record or CNAME
- **Target**: Your hosting provider's IP/domain
- **SSL**: Ensure HTTPS is enabled

### Hosting Provider Steps

1. Upload all files from `dist/` to web root
2. Ensure directory structure is preserved
3. Verify SSL certificate is active
4. Test that files are accessible at:
   - `https://simulateai.io/`
   - `https://simulateai.io/app.html`
   - `https://simulateai.io/src/js/config/firebase-config.js`

## ✅ Post-Deployment Testing

### 1. Load Main Pages

- [ ] `https://simulateai.io/` (Landing page)
- [ ] `https://simulateai.io/app.html` (Main app)
- [ ] `https://simulateai.io/blog.html` (Blog)

### 2. Check Console for Errors

Open browser dev tools and verify:

- [ ] No 404 errors for JavaScript modules
- [ ] Firebase services load correctly
- [ ] Service Worker registers successfully

### 3. Test PWA Features

- [ ] Install prompt appears (if applicable)
- [ ] Offline functionality works
- [ ] App loads from cache when offline

### 4. Performance Check

- [ ] Page load times are reasonable
- [ ] All assets load from simulateai.io domain
- [ ] No mixed content warnings (HTTP/HTTPS)

## 🔧 Troubleshooting

### If you get 404 errors for JS modules:

1. Verify files exist in your upload:

   ```
   https://simulateai.io/src/js/config/firebase-config.js
   https://simulateai.io/src/js/data/system-metadata-schema.js
   https://simulateai.io/src/js/data/scenario-creation-dates.js
   ```

2. Check file permissions on your server
3. Ensure directory structure matches exactly

### If Service Worker fails:

1. Verify `sw.js` is in the root directory
2. Check that HTTPS is properly configured
3. Clear browser cache and reload

### If Firebase errors occur:

1. Verify firebase-config.js is accessible
2. Check Firebase project settings
3. Ensure API keys are valid

## 📞 Support

If issues persist:

1. Check browser console for specific error messages
2. Verify all files from `dist/` were uploaded
3. Test with different browsers
4. Clear browser cache completely

---

**Last Updated**: August 1, 2025  
**SimulateAI Version**: 1.70  
**Domain**: simulateai.io
