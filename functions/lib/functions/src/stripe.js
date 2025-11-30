"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = void 0;
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});
/**
 * Creates a Stripe payment intent.
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { amount, currency, paymentMethodId, description, metadata } = data;
    if (!amount || !currency) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid amount and currency.');
    }
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            description: description,
            payment_method: paymentMethodId,
            payment_method_types: ['card'],
            metadata: metadata,
            automatic_payment_methods: { enabled: true },
        });
        return { clientSecret: paymentIntent.client_secret };
    }
    catch (error) {
        console.error('Stripe payment intent creation failed:', error);
        throw new functions.https.HttpsError('internal', 'Unable to create payment intent.', error);
    }
});
//# sourceMappingURL=stripe.js.map