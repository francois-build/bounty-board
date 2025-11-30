
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Resolves a short link and redirects the user.
 *
 * This function is triggered by an HTTP request.
 */
export const resolveShortLink = functions.https.onRequest(async (req, res) => {
  // 1. Parse
  const slug = req.path.substring(1); // Remove leading '/'

  if (!slug) {
    res.status(404).send("Link not found");
    return;
  }

  // 2. Lookup
  const linkDocRef = db.collection("short_links").doc(slug);
  const doc = await linkDocRef.get();

  // 3. Logic
  if (!doc.exists) {
    res.status(404).send("Link not found");
    return;
  }

  const data = doc.data();
  if (!data || !data.destinationUrl) {
    res.status(500).send("Invalid link data");
    return;
  }

  // Increment clicks asynchronously
  linkDocRef.update({ clicks: admin.firestore.FieldValue.increment(1) })
    .catch(err => console.error("Failed to increment clicks", err));

  // Redirect
  res.redirect(301, data.destinationUrl);
});
