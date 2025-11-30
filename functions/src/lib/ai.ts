import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AuditLogEntry } from '../../../packages/shared/src/types';

const MODEL_NAME = 'gemini-1.0-pro';
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

async function generateContent(parts: any[]) {
    const result = await model.generateContent({ contents: [{ role: 'user', parts }], generationConfig, safetySettings });
    return result.response;
}

export const onMessageCreate = functions.firestore.document('/chats/{chatId}/messages/{messageId}').onCreate(async (snap, context) => {
    if (snap.data().role === 'user') {
        const parts = snap.data().parts;
        const response = await generateContent(parts);

        await admin.firestore().collection('chats').doc(context.params.chatId).collection('messages').add({ 
            parts: response.text(), 
            role: 'model', 
            createdAt: admin.firestore.FieldValue.serverTimestamp() 
        });

        // Log the interaction for auditing
        const logEntry: AuditLogEntry = {
            event: 'Gemini AI Interaction',
            uid: snap.data().uid, // Assuming uid is stored on the message
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: `User query: ${parts.map((p: any) => p.text).join(' ')}`,
        };
        await admin.firestore().collection('audit_log').add(logEntry);
    }
});
