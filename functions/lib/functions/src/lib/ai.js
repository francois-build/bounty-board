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
exports.onMessageCreate = void 0;
exports.extractChallengeMetadata = extractChallengeMetadata;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const generative_ai_1 = require("@google/generative-ai");
const MODEL_NAME = 'gemini-1.0-pro';
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
}
const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });
const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};
const safetySettings = [
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
async function generateContent(parts) {
    const result = await model.generateContent({ contents: [{ role: 'user', parts }], generationConfig, safetySettings });
    return result.response;
}
async function extractChallengeMetadata(description) {
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
    const jsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        const metadata = JSON.parse(jsonText);
        return metadata;
    }
    catch (error) {
        console.error("Failed to parse AI response as JSON:", jsonText, error);
        throw new functions.https.HttpsError('internal', 'Failed to parse AI metadata response.');
    }
}
exports.onMessageCreate = functions.firestore.document('/chats/{chatId}/messages/{messageId}').onCreate(async (snap, context) => {
    if (snap.data().role === 'user') {
        const parts = snap.data().parts;
        const response = await generateContent(parts);
        await admin.firestore().collection('chats').doc(context.params.chatId).collection('messages').add({
            parts: response.text(),
            role: 'model',
            createdAt: Date.now()
        });
        // Log the interaction for auditing
        const logEntry = {
            event: 'Gemini AI Interaction',
            uid: snap.data().uid, // Assuming uid is stored on the message
            timestamp: Date.now(),
            details: `User query: ${parts.map((p) => p.text).join(' ')}`,
        };
        await admin.firestore().collection('audit_log').add(logEntry);
    }
});
//# sourceMappingURL=ai.js.map