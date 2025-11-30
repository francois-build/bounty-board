
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// --- EXPORTING ALL FUNCTIONS ---

// Account Management, Payment, and Webhooks
const paymentFunctions = require('./payments'); // Assume payments.js contains the original functions
exports.createStripeAccount = paymentFunctions.createStripeAccount;
exports.createMilestonePayment = paymentFunctions.createMilestonePayment;
exports.releaseMilestoneFunds = paymentFunctions.releaseMilestoneFunds;
exports.createServiceInvoice = paymentFunctions.createServiceInvoice;
exports.fileDispute = paymentFunctions.fileDispute;
exports.stripeWebhook = paymentFunctions.stripeWebhook;

// Scheduled Functions
const scheduledFunctions = require('./scheduled');
exports.calculateDailyStats = scheduledFunctions.calculateDailyStats;

// Admin Functions
const adminFunctions = require('./admin');
exports.manualVerify = adminFunctions.manualVerify;
exports.impersonate = adminFunctions.impersonate;
exports.forceEscrowFunded = adminFunctions.forceEscrowFunded;
exports.importLeads = adminFunctions.importLeads;
