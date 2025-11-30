"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ondeckupload = void 0;
const functions = require("firebase-functions");
const storage_1 = require("firebase-admin/storage");
const firestore_1 = require("firebase-admin/firestore");
const generative_ai_1 = require("@google/generative-ai");
const logger = require("firebase-functions/logger");
const db = (0, firestore_1.getFirestore)();
const storage = (0, storage_1.getStorage)();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
/**
 * Converts a stream to a buffer.
 */
async function streamToBuffer(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}
exports.ondeckupload = functions.storage.object().onFinalize(async (object) => {
    const { bucket, name, contentType } = object;
    // Exit if this is not a deck upload
    if (!name || !name.startsWith('decks/') || !contentType) {
        logger.log("Not a deck upload, skipping.");
        return null;
    }
    // Extract the UID from the file path
    const uid = name.split('/')[1];
    if (!uid) {
        logger.error(`Could not determine UID from path: ${name}`);
        return null;
    }
    logger.info(`Processing deck upload for user ${uid}: ${name}`);
    try {
        // Download the file from Storage
        const file = storage.bucket(bucket).file(name);
        const buffer = await streamToBuffer(file.createReadStream());
        // Call the AI model (Gemini with Vision)
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const prompt = `
            Analyze this pitch deck and extract the following information in a valid JSON format:
            1. problem_solved: A concise summary of the core problem the company is solving.
            2. tech_stack: An array of key technologies, frameworks, or languages mentioned.
            3. traction_metrics: A summary of any quantifiable traction or key performance indicators (e.g., user numbers, revenue, growth rates).
        `;
        const imagePart = {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType: contentType,
            },
        };
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);
        // Write the extracted data to the user's profile
        const userProfileRef = db.collection('users').doc(uid);
        await userProfileRef.set({ profile: { parsed_data: parsedData } }, { merge: true });
        logger.info(`Successfully parsed deck and updated profile for user ${uid}`);
        const auditLog = {
            timestamp: Date.now(),
            level: "info",
            message: `Deck parsed successfully for user ${uid}`,
            context: { userId: uid, fileName: name },
        };
        await db.collection("sys_audit_logs").add(auditLog);
        return null;
    }
    catch (error) {
        logger.error(`Error processing deck for user ${uid}:`, error);
        const auditLog = {
            timestamp: Date.now(),
            level: "error",
            message: `Failed to parse deck for user ${uid}`,
            context: { userId: uid, error: error instanceof Error ? error.message : String(error) },
        };
        await db.collection("sys_audit_logs").add(auditLog);
        return null;
    }
});
//# sourceMappingURL=onDeckUpload.js.map