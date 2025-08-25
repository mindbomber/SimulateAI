# CLI Tools Reference Guide

## 🛠️ Installed Development Tools

### Code Quality & Formatting

- **Prettier** (`prettier`) - Code formatter
- **ESLint** (`eslint`) - JavaScript linter
- **HTMLHint** (`htmlhint`) - HTML validator

### Package Management

- **npm-check-updates** (`ncu`) - Update package dependencies
- **npm audit** - Security vulnerability scanner

### Development Servers

- **Live Server** (`live-server`) - Auto-reloading development server
- **HTTP Server** (`http-server`) - Simple static file server
- **JSON Server** (`json-server`) - Mock REST API server

### Utilities

- **TLDR** (`tldr`) - Simplified man pages
- **Concurrently** (`concurrently`) - Run multiple commands
- **Nodemon** (`nodemon`) - Auto-restart on file changes

## 🚀 Quick Commands

### Code Formatting & Linting

```bash
# Format all JavaScript, HTML, CSS files
prettier --write "src/**/*.{js,html,css,md}"

# Check JavaScript for issues
eslint src/js/**/*.js

# Fix JavaScript issues automatically
eslint src/js/**/*.js --fix

# Validate HTML files
htmlhint *.html
```

### Package Management

```bash
# Check for package updates
ncu

# Update all packages
ncu -u && npm install

# Check for security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

### Development Servers

```bash
# Start live-reloading server on port 3000
live-server --port=3000 --open=/index.html

# Start simple HTTP server
http-server -p 3000 -o

# Mock REST API (if you have db.json)
json-server --watch db.json --port 3001
```

### Utilities

```bash
# Get simple help for any command
tldr git
tldr npm
tldr prettier

# Run multiple commands at once
concurrently "npm run dev" "npm run watch-css"

# Auto-restart server on changes
nodemon server.js
```

## 📋 Useful Workflows

### Before Committing Code

```bash
prettier --write "src/**/*.{js,html,css,md}"
eslint src/js/**/*.js --fix
htmlhint *.html
npm audit
```

### Starting Development

```bash
live-server --port=3000 --open=/index.html
```

### Monthly Maintenance

```bash
ncu -u && npm install
npm audit fix
```

## 🔧 Configuration Files Created

- `.prettierrc` - Prettier formatting rules
- `.htmlhintrc` - HTML validation rules
- `eslint.config.js` - ESLint configuration
- `scripts.json` - Quick reference scripts

## 💡 Pro Tips

1. Use `tldr` instead of `man` for quick command references
2. Set up git hooks to run linting before commits
3. Use `concurrently` to run multiple watchers during development
4. Regular `ncu` checks keep dependencies updated
5. `npm audit` should be run weekly for security
