
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { defineString } from 'firebase-functions/params';

admin.initializeApp();

const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripe = new Stripe(stripeSecretKey.value(), {
  apiVersion: '2023-10-16',
});

// ... (createStripeAccount and getAccountLink functions remain the same)

/**
 * Creates a PaymentIntent for a milestone payment.
 */
export const createMilestonePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { amount, conciergePurchased, milestoneId } = data;
  const applicationFeeAmount = conciergePurchased ? 0 : Math.floor(amount * 0.10);

  let paymentMethodTypes: Stripe.PaymentIntentCreateParams.PaymentMethodType[] = ['card'];

  if (amount > 5000) {
    paymentMethodTypes = ['ach_debit', 'wire_transfer'];
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    application_fee_amount: applicationFeeAmount,
    transfer_group: milestoneId,
    payment_method_types: paymentMethodTypes,
  });

  return { clientSecret: paymentIntent.client_secret };
});

/**
 * Releases funds to the freelancer and scout upon milestone approval.
 */
export const releaseMilestone = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { milestoneId, freelancerAccountId, scoutAccountId, amount, platformFee } = data;

  // Transfer to freelancer
  await stripe.transfers.create({
    amount: amount - platformFee,
    currency: 'usd',
    destination: freelancerAccountId,
    transfer_group: milestoneId,
  });

  // Transfer to scout
  await stripe.transfers.create({
    amount: Math.floor(platformFee * 0.10),
    currency: 'usd',
    destination: scoutAccountId,
    transfer_group: milestoneId,
  });

  return { success: true };
});

/**
 * Creates a Stripe Checkout session to charge a dispute stake.
 */
export const fileDispute = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { milestoneId } = data;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Dispute Stake',
        },
        unit_amount: 50000, // $500
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `https://your-app.com/dispute_success?milestone_id=${milestoneId}`,
    cancel_url: 'https://your-app.com/dispute_cancel',
  });

  return { sessionId: session.id };
});

/**
 * Creates a Stripe Checkout session for the concierge service invoice.
 */
export const createServiceInvoice = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { amount } = data;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Concierge Service',
        },
        unit_amount: amount, // Amount in cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'https://your-app.com/concierge_success',
    cancel_url: 'https://your-app.com/concierge_cancel',
  });

  return { sessionId: session.id };
});


/**
 * A webhook handler for Stripe events.
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = defineString('STRIPE_WEBHOOK_SECRET').value();

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.success_url && session.success_url.includes('dispute_success')) {
        const milestoneId = new URL(session.success_url).searchParams.get('milestone_id');
        if (milestoneId) {
            const milestoneRef = admin.firestore().collection('milestones').doc(milestoneId);
            await admin.firestore().runTransaction(async (transaction) => {
                transaction.update(milestoneRef, { status: 'dispute_active' });
            });
        }
    }
  }

  res.json({ received: true });
});

