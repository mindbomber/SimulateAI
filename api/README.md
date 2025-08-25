# reCAPTCHA Enterprise Backend Verification API

## Deployment Guide for SimulateAI

### Overview

This backend API provides server-side token verification for reCAPTCHA Enterprise, ensuring secure validation of frontend tokens submitted by users.

---

## Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Set up Google Cloud Authentication

```bash
# Option A: Service Account Key (Development)
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# Option B: Default Application Credentials (Production)
gcloud auth application-default login
```

### 3. Test Locally

```bash
npm start
# Server runs on http://localhost:3001
```

---

## Deployment Options

### Option 1: Firebase Cloud Functions (Recommended)

**Prerequisites:**

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project configured: `firebase init functions`

**Deploy:**

```bash
# From project root
firebase deploy --only functions

# Functions will be available at:
# https://us-central1-simulateai-research.cloudfunctions.net/verifyRecaptcha
# https://us-central1-simulateai-research.cloudfunctions.net/recaptchaHealth
```

**Update Frontend Configuration:**

```javascript
// In src/js/services/recaptcha-verification-service.js
const API_BASE_URL =
  "https://us-central1-simulateai-research.cloudfunctions.net";
```

### Option 2: Express.js Server (VPS/Cloud)

**Deploy to Google Cloud Run:**

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
EOF

# Build and deploy
gcloud builds submit --tag gcr.io/simulateai-research/recaptcha-api
gcloud run deploy recaptcha-api --image gcr.io/simulateai-research/recaptcha-api --platform managed
```

**Deploy to Heroku:**

```bash
# Install Heroku CLI and login
heroku create simulateai-recaptcha-api
git add .
git commit -m "Deploy reCAPTCHA API"
git push heroku main
```

---

## Configuration

### Environment Variables

```bash
# Required for production
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
export PORT=3001
export NODE_ENV=production

# Optional
export CORS_ORIGIN="https://simulateai.io,https://www.simulateai.io"
export LOG_LEVEL=info
```

### Google Cloud IAM Setup

**Required Permissions:**

- `recaptchaenterprise.assessments.create`
- `recaptchaenterprise.keys.get`

**Service Account Setup:**

```bash
# Create service account
gcloud iam service-accounts create recaptcha-verifier \
    --description="reCAPTCHA Enterprise verification service" \
    --display-name="reCAPTCHA Verifier"

# Grant permissions
gcloud projects add-iam-policy-binding simulateai-research \
    --member="serviceAccount:recaptcha-verifier@simulateai-research.iam.gserviceaccount.com" \
    --role="roles/recaptchaenterprise.agent"

# Create and download key
gcloud iam service-accounts keys create ~/recaptcha-key.json \
    --iam-account=recaptcha-verifier@simulateai-research.iam.gserviceaccount.com
```

---

## API Usage

### Endpoint: POST /api/verify-recaptcha

**Request:**

```javascript
const response = await fetch("/api/verify-recaptcha", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    token: "reCAPTCHA_TOKEN_FROM_FRONTEND",
    action: "auth_login",
    securityLevel: "medium", // high, medium, low, minimum
    siteKey: "6LcuUpsrAAAAAEzAeX1qx0cjShEt7Nf0f73rvLjf", // Optional validation
  }),
});
```

**Response:**

```javascript
{
  "success": true,
  "score": 0.85,
  "valid": true,
  "action": "auth_login",
  "reasons": ["BROWSER_NOT_SUSPICIOUS"],
  "assessmentName": "projects/simulateai-research/assessments/abc123",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### Endpoint: GET /api/health

**Response:**

```javascript
{
  "status": "healthy",
  "service": "recaptcha-enterprise-verification",
  "initialized": true,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

---

## Integration Examples

### Frontend Integration

```javascript
// Use with existing verification service
import { recaptchaVerificationService } from "./services/recaptcha-verification-service.js";

// Verify token with backend
const result = await recaptchaVerificationService.verifyToken(
  token,
  "auth_login",
  "high",
);

if (result.success && result.score >= 0.7) {
  // Proceed with authentication
  console.log("✅ reCAPTCHA verification passed");
} else {
  // Handle failed verification
  console.log("❌ reCAPTCHA verification failed");
}
```

### Firebase Authentication Integration

```javascript
// In your authentication flow
async function signInWithVerification(email, password, recaptchaToken) {
  try {
    // First verify reCAPTCHA
    const verification = await fetch("/api/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: recaptchaToken,
        action: "auth_login",
        securityLevel: "medium",
      }),
    });

    const result = await verification.json();

    if (!result.success || result.score < 0.5) {
      throw new Error("reCAPTCHA verification failed");
    }

    // Proceed with Firebase authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
}
```

---

## Security Thresholds

### Score Interpretation

- **0.9 - 1.0**: Very likely a legitimate user
- **0.7 - 0.9**: Likely a legitimate user
- **0.5 - 0.7**: Possibly a legitimate user
- **0.3 - 0.5**: Suspicious activity
- **0.0 - 0.3**: Very likely a bot

### Recommended Security Levels

- **high (0.9+)**: Financial transactions, admin actions
- **medium (0.7+)**: User authentication, form submissions
- **low (0.5+)**: Newsletter signups, feedback forms
- **minimum (0.3+)**: Anonymous interactions, browsing

---

## Monitoring and Analytics

### Logging

```javascript
// API automatically logs:
// ✅ Successful verifications with scores
// ⚠️ Failed verifications with reasons
// ❌ API errors and invalid requests
// 🔍 Assessment details for debugging
```

### Google Cloud Console

Monitor reCAPTCHA Enterprise metrics:

- Request volume and success rates
- Score distributions and trends
- Invalid token reasons
- Action-specific analytics

### Custom Metrics

```javascript
// Track verification results in your analytics
if (result.success) {
  analytics.track("recaptcha_verification_success", {
    action: result.action,
    score: result.score,
    security_level: securityLevel,
  });
} else {
  analytics.track("recaptcha_verification_failed", {
    action: result.action,
    error: result.error,
    reasons: result.reasons,
  });
}
```

---

## Troubleshooting

### Common Issues

**1. Authentication Errors**

```
Error: Could not load the default credentials
```

**Solution:** Set up Google Cloud authentication properly

**2. Invalid Token**

```
Token invalid: EXPIRED
```

**Solution:** Ensure frontend generates fresh tokens (tokens expire in 2 minutes)

**3. Action Mismatch**

```
Action mismatch. Expected: auth_login, Got: submit
```

**Solution:** Ensure frontend action matches backend expectation

**4. Low Scores**

```
Score: 0.1, Success: false
```

**Solution:** Check for bot activity, adjust security thresholds if needed

### Debug Mode

```javascript
// Enable detailed logging
export DEBUG=true
export LOG_LEVEL=debug
npm start
```

### Health Check

```bash
# Test API health
curl https://your-api-domain.com/api/health

# Expected response
{
  "status": "healthy",
  "service": "recaptcha-enterprise-verification",
  "initialized": true
}
```

---

## Production Checklist

- [ ] Google Cloud credentials configured
- [ ] Firebase project permissions set
- [ ] Environment variables configured
- [ ] CORS origins configured for production domains
- [ ] API endpoints updated in frontend
- [ ] Health check endpoint accessible
- [ ] Monitoring and logging configured
- [ ] Security thresholds tuned for your use case
- [ ] Backup verification method implemented
- [ ] Error handling tested

---

## Next Steps

1. **Deploy the API** using Firebase Cloud Functions or your preferred hosting
2. **Update frontend configuration** to use the deployed API endpoint
3. **Test end-to-end flow** with actual user interactions
4. **Monitor verification metrics** and adjust security thresholds
5. **Implement additional security layers** as needed (rate limiting, IP blocking)

The backend verification API is now ready for production use with your reCAPTCHA Enterprise setup!
