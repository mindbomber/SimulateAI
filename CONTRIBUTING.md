# Contributing to SimulateAI

Thank you for your interest in contributing to SimulateAI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Issues and Bug Reports](#issues-and-bug-reports)

## Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment for all contributors. Please read and follow our code of conduct.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git
- Basic knowledge of JavaScript, HTML, and CSS

### Development Setup

1. **Fork the repository**

   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/SimulateAI.git
   cd SimulateAI
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   # Copy the example environment file
   cp .env.example .env
   # Edit .env with your configuration (see README.md for details)
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Verify setup**
   ```bash
   npm run verify
   npm run security-check
   ```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes** - Help us identify and fix issues
- **Feature enhancements** - Improve existing functionality
- **New features** - Add new capabilities to SimulateAI
- **Documentation** - Improve docs, guides, and examples
- **Educational content** - Add new scenarios, categories, or learning modules
- **Accessibility improvements** - Make the platform more accessible
- **Performance optimizations** - Improve speed and efficiency

### Before You Start

1. **Check existing issues** - Look for related issues or discussions
2. **Create an issue** - For new features or significant changes
3. **Discuss first** - For major changes, discuss with maintainers
4. **Small PRs** - Keep pull requests focused and reasonably sized

## Coding Standards

### JavaScript Standards

- **ES6+ syntax** - Use modern JavaScript features
- **Modular design** - Follow established patterns in `src/js/core/`
- **Error handling** - Use try-catch blocks and proper error logging
- **Documentation** - Include JSDoc comments for functions and classes
- **No console.log** - Use the logger utility instead

### CSS Standards

- **CSS Layers** - Follow the established CSS layers architecture
- **Component-focused** - Keep styles component-specific
- **No dark mode in components** - Use `css-layers.css` for theme overrides
- **Design tokens** - Use CSS custom properties for consistency

### File Organization

```
src/
├── js/
│   ├── core/           # Core system components
│   ├── services/       # External service integrations
│   ├── components/     # Reusable UI components
│   ├── utils/          # Utility functions
│   └── constants/      # Application constants
├── styles/             # CSS files (layers architecture)
├── config/             # JSON configuration files
└── components/         # HTML templates
```

### Security Guidelines

- **Never commit secrets** - Use environment variables
- **Validate inputs** - Sanitize all user inputs
- **Use established patterns** - Follow DataHandler and Firebase services
- **GDPR compliance** - Respect user privacy and consent

## Pull Request Process

### 1. Create a Branch

```bash
# Create a feature branch from main
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow coding standards
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run security check
npm run security-check

# Test manually in browser
npm run dev
```

### 4. Commit Guidelines

Use conventional commit format:

```
type(scope): description

Examples:
feat(onboarding): add new tutorial step animations
fix(badge): resolve modal display issue in dark mode
docs(readme): update installation instructions
style(css): consolidate button styles in layers
```

### 5. Submit Pull Request

1. Push your branch to your fork
2. Create a pull request against the main branch
3. Fill out the PR template completely
4. Link any related issues
5. Wait for review and address feedback

### Pull Request Checklist

- [ ] Code follows project coding standards
- [ ] Changes are tested and working
- [ ] Documentation is updated (if needed)
- [ ] Security check passes
- [ ] Linting passes
- [ ] Commit messages are clear and conventional
- [ ] PR description explains the changes
- [ ] Related issues are linked

## Issues and Bug Reports

### Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Browser and version** information
- **Screenshots or videos** (if applicable)
- **Console errors** (if any)

### Feature Requests

For feature requests:

- **Use case description** - Why is this needed?
- **Proposed solution** - How should it work?
- **Educational context** - How does it benefit learning?
- **Alternative solutions** - Other approaches considered

### Issue Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation updates
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Urgent issues
- `accessibility` - Accessibility improvements

## Educational Context

SimulateAI is an educational platform focused on AI ethics. When contributing:

- **Consider learning outcomes** - How does this help education?
- **Follow ISTE standards** - Align with educational technology standards
- **Think about accessibility** - Ensure all learners can participate
- **Research context** - Consider research and data collection needs

## Development Resources

### Key Files to Understand

- `src/js/core/data-handler.js` - Central data management
- `src/js/core/global-event-manager.js` - Event coordination
- `src/js/core/ui-binder.js` - UI management system
- `src/styles/css-layers.css` - CSS architecture
- `src/config/app-config.json` - Application configuration

### Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Check code style
npm run format       # Format code
npm run verify       # Verify components
npm run security-check # Security validation
```

## Getting Help

- **GitHub Discussions** - For questions and general discussion
- **Issues** - For bug reports and feature requests
- **Email** - contact@simulateai.com for sensitive matters

## License

By contributing to SimulateAI, you agree that your contributions will be licensed under the Apache License 2.0.

Thank you for contributing to SimulateAI! Your efforts help make AI ethics education more accessible and engaging for everyone.
