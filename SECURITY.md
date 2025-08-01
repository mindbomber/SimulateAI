# Security Policy

## Supported Versions

We provide security updates for the following versions of SimulateAI:

| Version | Supported          |
| ------- | ------------------ |
| 1.20.x  | :white_check_mark: |
| 1.19.x  | :white_check_mark: |
| < 1.19  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within SimulateAI, please send an email to security@simulateai.com. All security vulnerabilities will be promptly addressed.

**Please do not disclose security-related issues publicly until they have been addressed by our team.**

### What to include in your report:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (if available)

### Response Timeline:

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Varies by severity (1-30 days)

## Security Measures

### Environment Variables

- All sensitive configuration is stored in environment variables
- Production keys are never committed to the repository
- `.env` files are properly gitignored

### Firebase Security

- Firebase security rules are implemented
- Authentication is required for sensitive operations
- User data is properly scoped and protected

### Dependencies

- Regular security audits via `npm audit`
- Automated dependency updates for security patches
- Use of trusted, well-maintained packages

### Data Protection

- GDPR compliance for user data
- User consent management
- Data encryption in transit and at rest
- Minimal data collection principle

## Best Practices for Contributors

1. **Never commit sensitive data** (API keys, passwords, etc.)
2. **Use environment variables** for configuration
3. **Validate all user inputs** to prevent XSS and injection attacks
4. **Follow secure coding practices** outlined in our contributing guide
5. **Keep dependencies updated** and review security advisories

## Security Tools

We use the following tools to maintain security:

- ESLint with security plugins
- Automated security scanning
- Pre-commit hooks for security checks
- Regular dependency audits

## Contact

For security-related questions or concerns, please contact:

- Email: security@simulateai.com
- GitHub Security Advisories: Use the "Report a vulnerability" button
