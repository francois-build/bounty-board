"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe_1 = require("stripe");
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
/**
 * Creates a Stripe payment intent.
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { amount, currency, paymentMethodId, description, metadata, challengeId } = data;
    const uid = context.auth.uid;
    if (!amount || !currency) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid amount and currency.');
    }
    let application_fee_amount = 0;
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const isConcierge = userDoc.exists && ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.isConcierge); // Assuming isConcierge flag on user
    if (challengeId) {
        const challengeDoc = await admin.firestore().collection('challenges').doc(challengeId).get();
        if ((challengeDoc.exists && ((_b = challengeDoc.data()) === null || _b === void 0 ? void 0 : _b.isBuildEvent)) || isConcierge) {
            application_fee_amount = 0;
        }
        else {
            // As per monetization_matrix.md, calculate standard 10% fee.
            application_fee_amount = Math.round(amount * 0.10);
        }
    }
    else {
        // Default fee for payments not associated with a challenge
        application_fee_amount = Math.round(amount * 0.10);
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
    }
    catch (error) {
        console.error('Stripe payment intent creation failed:', error);
        throw new functions.https.HttpsError('internal', 'Unable to create payment intent.', error);
    }
});
//# sourceMappingURL=stripe.js.map