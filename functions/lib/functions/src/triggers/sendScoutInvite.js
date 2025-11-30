"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendScoutInvite = void 0;
const functions = __importStar(require("firebase-functions"));
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