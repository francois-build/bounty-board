"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendScoutInvite = void 0;
const functions = require("firebase-functions");
const resend_1 = require("resend");
const params_1 = require("firebase-functions/params");
// Define the Resend API key as a secret
const resendApiKey = (0, params_1.defineSecret)('RESEND_API_KEY');
exports.sendScoutInvite = functions
    .runWith({ secrets: [resendApiKey] })
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to send a scout invite.');
    }
    const { email, name } = data;
    const { uid } = context.auth.token;
    // Initialize Resend client with the secret API key
    const resend = new resend_1.Resend(resendApiKey.value());
    // Send email using Resend
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `You've been invited by ${name} to join our app!`,
        html: `Click here to join: <a href="https://yourapp.com/invite?ref=${uid}">Join Now</a>`,
    });
    return { success: true };
});
//# sourceMappingURL=sendScoutInvite.js.map