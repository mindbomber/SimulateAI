// Backend API Example for Stripe Integration
// This is a template showing how to integrate with Stripe on your backend

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // Your Firebase service account key
    }),
    databaseURL: 'your-firebase-database-url',
  });
}

const db = admin.firestore();

// API endpoint to create Stripe checkout session
async function createCheckoutSession(req, res) {
  try {
    const { priceId, customerId, tier, userId, userEmail, metadata } = req.body;

    // Verify user authentication
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (decodedToken.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUid: userId,
        },
      });

      // Save customer ID to Firebase
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customer.id,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/profile.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/profile.html?success=false`,
      metadata,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}

// API endpoint to handle payment success
async function handlePaymentSuccess(req, res) {
  try {
    const { sessionId, userId } = req.body;

    // Verify user authentication
    const token = req.headers.authorization?.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    if (decodedToken.uid !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Retrieve subscription details
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      // Map tier to flair
      const tierMapping = {
        1: { flair: 'bronze', tierName: 'Research Contributor' },
        2: { flair: 'silver', tierName: 'Community Supporter' },
        3: { flair: 'gold', tierName: 'Education Patron' },
      };

      const { tier } = session.metadata;
      const tierInfo = tierMapping[tier];

      // Update user profile in Firebase
      await db
        .collection('users')
        .doc(userId)
        .update({
          tier: parseInt(tier),
          flair: tierInfo.flair,
          stripeCustomerId: session.customer,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          totalDonated: admin.firestore.FieldValue.increment(
            subscription.items.data[0].price.unit_amount / 100
          ),
          lastPaymentDate: new Date(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      res.json({
        success: true,
        tier: parseInt(tier),
        flair: tierInfo.flair,
        tierName: tierInfo.tierName,
        stripeCustomerId: session.customer,
        totalDonated: subscription.items.data[0].price.unit_amount / 100,
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({ error: error.message });
  }
}

// Webhook endpoint to handle Stripe events
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdate(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleSubscriptionCancellation(deletedSubscription);
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      await handleSuccessfulPayment(invoice);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      await handleFailedPayment(failedInvoice);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

async function handleSubscriptionUpdate(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      await db.collection('users').doc(userId).update({
        subscriptionStatus: subscription.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancellation(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      await db
        .collection('users')
        .doc(userId)
        .update({
          tier: 0,
          flair: null,
          subscriptionStatus: 'cancelled',
          subscriptionEndDate: new Date(subscription.ended_at * 1000),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleSuccessfulPayment(invoice) {
  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      await db
        .collection('users')
        .doc(userId)
        .update({
          lastPaymentDate: new Date(invoice.created * 1000),
          totalDonated: admin.firestore.FieldValue.increment(
            invoice.amount_paid / 100
          ),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(invoice) {
  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      // Could implement grace period logic here
      console.log(`Payment failed for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

// Express.js route setup example
/*
const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/create-checkout-session', createCheckoutSession);
app.post('/api/payment-success', handlePaymentSuccess);
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
*/

module.exports = {
  createCheckoutSession,
  handlePaymentSuccess,
  handleStripeWebhook,
};
