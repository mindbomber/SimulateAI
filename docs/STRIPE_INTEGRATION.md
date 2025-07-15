# Stripe Integration Guide for SimulateAI

## Overview

This guide explains how to integrate Stripe payments with your SimulateAI profile system. The code
pattern you provided:

```javascript
<p>Welcome, <span id="userName"></span> <span id="userFlair"></span></p>
<script>
  auth.onAuthStateChanged(user => {
    if (user) {
      db.collection("users").doc(user.uid).get().then(doc => {
        const data = doc.data();
        document.getElementById("userName").textContent = data.name;
        document.getElementById("userFlair").textContent =
          data.flair === "gold" ? "🏆" :
          data.flair === "silver" ? "🥈" :
          data.flair === "bronze" ? "🥉" : "";
      });
    }
  });
</script>
```

Is **perfect** for displaying donation tiers! This pattern has been integrated into your enhanced
profile system.

## Integration Status ✅

Your `enhanced-profile.js` has been updated to include:

### 1. **Flair Display System**

- 🏆 Gold tier (Education Patron - $100/month)
- 🥈 Silver tier (Community Supporter - $25/month)
- 🥉 Bronze tier (Research Contributor - $5/month)

### 2. **Stripe Payment Processing**

- Creates Stripe checkout sessions
- Handles payment success callbacks
- Updates user profiles with tier information
- Manages subscription status

### 3. **Firebase Integration**

- Stores Stripe customer IDs
- Tracks donation amounts and tiers
- Updates user flair based on donations
- Syncs with authentication state

## Setup Required

### 1. **Stripe Configuration**

Create these price IDs in your Stripe dashboard:

- `price_bronze_monthly` - $5/month
- `price_silver_monthly` - $25/month
- `price_gold_monthly` - $100/month

### 2. **Backend API Endpoints**

You need to implement:

- `POST /api/create-checkout-session`
- `POST /api/payment-success`
- `POST /api/stripe-webhook`

### 3. **Environment Variables**

```
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3003
```

### 4. **Firebase Schema**

Update your users collection to include:

```javascript
{
  name: "John Doe",
  email: "john@example.com",
  flair: "gold", // bronze, silver, gold, or null
  tier: 3, // 0=free, 1=bronze, 2=silver, 3=gold
  stripeCustomerId: "cus_...",
  subscriptionId: "sub_...",
  subscriptionStatus: "active",
  totalDonated: 100,
  lastPaymentDate: "2025-07-14T..."
}
```

## How It Works

### 1. **User Donates**

1. User clicks donation tier button
2. System creates Stripe checkout session
3. User redirects to Stripe payment page
4. User completes payment

### 2. **Payment Success**

1. Stripe redirects back to profile page with `session_id`
2. Frontend calls `/api/payment-success` endpoint
3. Backend verifies payment with Stripe
4. Updates user profile in Firebase with new tier/flair
5. Frontend displays success message and updates UI

### 3. **Display Flair**

Your existing pattern works perfectly:

```javascript
// In your enhanced-profile.js:
getUserFlair() {
  if (!this.userProfile?.flair) return '';

  switch (this.userProfile.flair) {
    case 'gold': return '🏆';
    case 'silver': return '🥈';
    case 'bronze': return '🥉';
    default: return '';
  }
}
```

## Testing

1. **Start development server:** Already running on `http://localhost:3003`
2. **Visit profile page:** `http://localhost:3003/profile.html`
3. **Test donation flow** (will need backend setup)

## Files Modified

- ✅ `enhanced-profile.js` - Added Stripe integration
- ✅ `enhanced-profile.css` - Flair styling included
- ✅ `profile.html` - Donation UI implemented
- 📄 `stripe-integration-backend.js` - Backend reference code

## Next Steps

1. **Set up Stripe account** and get API keys
2. **Implement backend API** using the reference code provided
3. **Update price IDs** in frontend code to match your Stripe products
4. **Test payment flow** end-to-end
5. **Configure webhooks** for subscription management

Your code pattern is excellent and already integrated! The flair display system will work perfectly
with the donation tiers. 🎉
