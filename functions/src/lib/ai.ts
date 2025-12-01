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

export async function extractChallengeMetadata(description: string): Promise<{ tags: string[]; budget_estimate: string; public_alias: string; }> {
    const parts = [
        {
            text: `
                Analyze the following project description and extract the following information:
                1.  **Tags**: A list of relevant technical and business keywords (e.g., "React", "Firebase", "Fintech", "AI").
                2.  **Budget Estimate**: A rough, non-binding budget range for the project (e.g., "$500 - $1,500", "$10,000 - $25,000").
                3.  **Public Alias**: A short, catchy, and professional-sounding project name.

                Description:
                "${description}"

                Return the output as a valid JSON object with the keys "tags", "budget_estimate", and "public_alias".
                Do not include any other text or markdown formatting in your response.
                Example:
                {
                    "tags": ["React", "Firebase", "Real-time Chat"],
                    "budget_estimate": "$2,000 - $5,000",
                    "public_alias": "ChatSpark"
                }
            `
        },
    ];

    const result = await model.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig,
        safetySettings,
    });

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : "{}";

    try {
        const metadata = JSON.parse(jsonText);
        return metadata;
    } catch (error) {
        console.error("Failed to parse AI response as JSON:", jsonText, error);
        throw new functions.https.HttpsError('internal', 'Failed to parse AI metadata response.');
    }
}

export const onMessageCreate = functions.firestore.document('/chats/{chatId}/messages/{messageId}').onCreate(async (snap, context) => {
    if (!context.auth) return; // Exit if not authenticated

    if (snap.data().role === 'user') {
        const parts = snap.data().parts;
        const response = await generateContent(parts);

        await admin.firestore().collection('chats').doc(context.params.chatId).collection('messages').add({ 
            parts: response.text(), 
            role: 'model', 
            createdAt: Date.now() 
        });

        // Log the interaction for auditing
        const logEntry: AuditLogEntry = {
            event: 'Gemini AI Interaction',
            uid: snap.data().uid, // Assuming uid is stored on the message
            timestamp: Date.now(),
            details: `User query: ${parts.map((p: any) => p.text).join(' ')}`,
        };
        await admin.firestore().collection('audit_log').add(logEntry);
    }
});