
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { AuditLogEntry } from "../../../../packages/shared/src/types";

const db = getFirestore();

// Initialize the Google Generative AI client
// Ensure GEMINI_API_KEY is set in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ChallengeMetadata {
  tags: string[];
  budget_estimate: number | null;
  public_alias: string;
}

/**
 * Extracts structured metadata from a challenge description using an AI model.
 * @param {string} description The free-text description of the challenge.
 * @returns {Promise<ChallengeMetadata>} A promise that resolves to the extracted metadata.
 */
export async function extractChallengeMetadata(description: string): Promise<ChallengeMetadata> {
  const defaultResponse: ChallengeMetadata = {
    tags: [],
    budget_estimate: null,
    public_alias: 'Challenge',
  };

  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      Analyze the following project description and extract the specified information.
      Your response MUST be a valid JSON object.

      Description:
      "${description}"

      Extract the following fields:
      1.  tags: An array of 2-5 relevant strings for categorization (e.g., "Fintech", "React Native", "AI", "Data Science", "Healthcare").
      2.  budget_estimate: A number representing the estimated budget in USD. If no budget is mentioned, set this to null.
      3.  public_alias: A short, generalized, non-identifiable title for the project (e.g., "Mobile App for Logistics" instead of "FedEx's New Driver App").

      JSON Output:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsedResult: ChallengeMetadata = JSON.parse(text);
    
    // Basic validation
    if (!parsedResult.tags || !Array.isArray(parsedResult.tags)) {
        parsedResult.tags = [];
    }
    if (typeof parsedResult.budget_estimate !== 'number') {
        parsedResult.budget_estimate = null;
    }
    if (typeof parsedResult.public_alias !== 'string' || parsedResult.public_alias.length === 0) {
        parsedResult.public_alias = 'Challenge';
    }

    return parsedResult;

  } catch (error) {
    logger.error("Error in extractChallengeMetadata AI call:", error);

    // AI Governance: Log the failure to the audit log
    const auditLog: AuditLogEntry = {
      timestamp: Date.now(),
      level: "error",
      message: "AI metadata extraction failed.",
      context: { 
        service: "extractChallengeMetadata", 
        error: error instanceof Error ? error.message : String(error),
      },
    };
    await db.collection("sys_audit_logs").add(auditLog);

    // AI Governance: Fail open by returning a default/empty value
    return defaultResponse;
  }
}
