import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Creates a Stripe payment intent.
 */
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { amount, currency, paymentMethodId, description, metadata, challengeId } = data;

  if (!amount || !currency) {
    throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid amount and currency.');
  }

  let application_fee_amount = 0;

  if (challengeId) {
    const challengeDoc = await admin.firestore().collection('challenges').doc(challengeId).get();
    if (challengeDoc.exists && challengeDoc.data()?.isBuildEvent) {
      application_fee_amount = 0;
    } else {
      // As per monetization_matrix.md, calculate standard fee. Using 5% as a placeholder.
      application_fee_amount = Math.round(amount * 0.05);
    }
  } else {
    // Default fee for payments not associated with a challenge
    application_fee_amount = Math.round(amount * 0.05);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      description: description,
      payment_method: paymentMethodId,
      payment_method_types: ['card'],
      metadata: metadata,
      application_fee_amount: application_fee_amount,
      automatic_payment_methods: { enabled: true },
    });

    return { clientSecret: paymentIntent.client_secret };

  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create payment intent.', error);
  }
});
