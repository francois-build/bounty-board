"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendScoutInvite = void 0;
const functions = require("firebase-functions");
const email_1 = require("../utils/email");
exports.sendScoutInvite = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to send a scout invite.');
    }
    const { email, name } = data;
    const { uid } = context.auth.token;
    // Send email using Resend
    await email_1.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `You\'ve been invited by ${name} to join our app!`,
        html: `Click here to join: <a href="https://yourapp.com/invite?ref=${uid}">Join Now</a>`,
    });
    return { success: true };
});
//# sourceMappingURL=sendScoutInvite.js.map