const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = admin.firestore();

// --- ACCOUNT MANAGEMENT ---

exports.createStripeAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
  }
  const { uid } = context.auth;
  const { isScout } = data;

  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://<YOUR_DOMAIN>/refresh`,
      return_url: `https://<YOUR_DOMAIN>/return`,
      type: "account_onboarding",
    });

    const userRef = db.collection(isScout ? "scouts" : "users").doc(uid);
    await userRef.update({ stripeAccountId: account.id });

    return { url: accountLink.url };
  } catch (error) {
    console.error("Stripe account creation failed:", error);
    throw new functions.https.HttpsError("internal", "Could not create Stripe account.");
  }
});


// --- PAYMENT AND ESCROW LOGIC ---

exports.createMilestonePayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { pilotAmount, currency, description, milestoneId, clientId, startupStripeAccountId } = data;
    const platformSurchargeRate = 0.10; // 10% surcharge

    return db.runTransaction(async (transaction) => {
        const clientRef = db.collection("users").doc(clientId);
        const clientDoc = await transaction.get(clientRef);

        if (!clientDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Client not found.");
        }

        const clientData = clientDoc.data();
        let surcharge = pilotAmount * platformSurchargeRate;

        // Monetization Matrix Logic
        if (clientData.conciergePurchased) {
            const conciergeCounterRef = db.collection("internalCounters").doc("conciergeClients");
            const conciergeCounterDoc = await transaction.get(conciergeCounterRef);

            let clientCount = 0;
            if (conciergeCounterDoc.exists) {
                clientCount = conciergeCounterDoc.data().count;
            }

            if (clientCount < 10) {
                surcharge = 0; // Waive surcharge for the first 10 concierge clients
                
                // Check if this client has already been counted
                const clientRecordRef = db.collection("conciergeClients").doc(clientId);
                const clientRecordDoc = await transaction.get(clientRecordRef);

                if (!clientRecordDoc.exists) {
                    transaction.set(clientRecordRef, { counted: true });
                    transaction.set(conciergeCounterRef, { count: clientCount + 1 }, { merge: true });
                }
            }
        }

        const totalChargeAmount = pilotAmount + surcharge;
        const paymentMethods = totalChargeAmount > 500000 ? ['ach_debit', 'wire_transfer'] : ['card']; // $5000 in cents

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalChargeAmount,
            currency: currency,
            application_fee_amount: surcharge, // The platform's cut
            description: description,
            transfer_data: {
                destination: startupStripeAccountId, // Startup receives the original pilotAmount
            },
            transfer_group: milestoneId,
            payment_method_types: paymentMethods,
        });

        transaction.update(db.collection("milestones").doc(milestoneId), {
            paymentIntentId: paymentIntent.id,
            status: "funding",
            pilotAmount: pilotAmount,
            surcharge: surcharge,
            totalChargeAmount: totalChargeAmount
        });

        return { clientSecret: paymentIntent.client_secret };
    });
});

exports.releaseMilestoneFunds = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }

    const { milestoneId } = data;

    return db.runTransaction(async (transaction) => {
        const milestoneRef = db.collection("milestones").doc(milestoneId);
        const milestoneDoc = await transaction.get(milestoneRef);

        if (!milestoneDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Milestone not found.");
        }
        const milestoneData = milestoneDoc.data();

        const paymentIntent = await stripe.paymentIntents.retrieve(milestoneData.paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            throw new functions.https.HttpsError("failed-precondition", "Payment has not cleared. Funds cannot be released.");
        }

        const platformFee = paymentIntent.application_fee_amount;
        let scoutTransferId = null;

        if (platformFee > 0 && milestoneData.scoutId) {
            const scoutRef = db.collection("scouts").doc(milestoneData.scoutId);
            const scoutDoc = await transaction.get(scoutRef);
            if (scoutDoc.exists) {
                const scoutData = scoutDoc.data();
                const scoutFee = platformFee * 0.10; // 10% of platform fee

                const transfer = await stripe.transfers.create({
                    amount: scoutFee,
                    currency: paymentIntent.currency,
                    destination: scoutData.stripeAccountId,
                    transfer_group: milestoneId,
                    description: `Scout commission for milestone ${milestoneId}`
                });
                scoutTransferId = transfer.id;
            }
        }

        transaction.update(milestoneRef, {
            status: "completed",
            scoutTransferId: scoutTransferId,
        });

        return { success: true, scoutTransferId: scoutTransferId };
    });
});

// --- SERVICE AND DISPUTE INVOICES ---

exports.createServiceInvoice = functions.https.onCall(async (data) => {
    const { amount, currency, successUrl, cancelUrl } = data;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: currency,
                product_data: { name: "Concierge Service Fee" },
                unit_amount: amount,
            },
            quantity: 1,
        }],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
    return { id: session.id };
});

exports.fileDispute = functions.https.onCall(async (data) => {
    const { milestoneId, successUrl, cancelUrl } = data;
    await db.collection("milestones").doc(milestoneId).update({ status: "dispute_active" });
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: "usd",
                product_data: { name: "Dispute Stake" },
                unit_amount: 50000,
            },
            quantity: 1,
        }],
        mode: "payment",
        success_url: `${successUrl}?milestone_id=${milestoneId}`,
        cancel_url: cancelUrl,
    });
    return { id: session.id };
});

// --- STRIPE WEBHOOK HANDLER ---

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const eventRef = db.collection('processedEvents').doc(event.id);
  const doc = await eventRef.get();
  if (doc.exists) {
      console.log(`Event ${event.id} already processed.`);
      return res.status(200).send('Already processed');
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const milestoneQuery = await db.collection('milestones').where('paymentIntentId', '==', paymentIntent.id).get();
      if (!milestoneQuery.empty) {
          const milestoneDoc = milestoneQuery.docs[0];
          await milestoneDoc.ref.update({ status: 'funded' });
          console.log(`Milestone ${milestoneDoc.id} successfully funded.`);
      }
      break;
    case 'account.updated':
      const account = event.data.object;
      if (account.charges_enabled && account.details_submitted) {
        console.log(`Account ${account.id} is now enabled for charges.`);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  await eventRef.set({ receivedAt: admin.firestore.FieldValue.serverTimestamp() });

  res.status(200).send();
});
