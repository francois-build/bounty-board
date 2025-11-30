import * as functions from 'firebase-functions';
import { Resend } from 'resend';
import { defineSecret } from 'firebase-functions/params';
// Define the Resend API key as a secret
const resendApiKey = defineSecret('RESEND_API_KEY');
export const sendScoutInvite = functions
    .runWith({ secrets: [resendApiKey] })
    .https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to send a scout invite.');
    }
    const { email, name } = data;
    const { uid } = context.auth.token;
    // Initialize Resend client with the secret API key
    const resend = new Resend(resendApiKey.value());
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