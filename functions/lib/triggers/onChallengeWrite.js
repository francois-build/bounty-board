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
exports.onChallengeWrite = void 0;
const functions = __importStar(require("firebase-functions"));
const typesense_1 = require("typesense");
const params_1 = require("firebase-functions/params");
// Define secrets for Typesense
const typesenseApiKey = (0, params_1.defineSecret)("TYPESENSE_API_KEY");
// It is assumed you have the following in your .env file:
// TYPESENSE_HOST=xxx.a1.typesense.net
// TYPESENSE_PORT=443
// TYPESENSE_PROTOCOL=https
exports.onChallengeWrite = functions.runWith({ secrets: [typesenseApiKey] }).firestore
    .document("challenges/{challengeId}")
    .onWrite(async (change, context) => {
    // Initialize Typesense client inside the function
    const typesense = new typesense_1.Client({
        nodes: [
            {
                host: process.env.TYPESENSE_HOST,
                port: Number(process.env.TYPESENSE_PORT),
                protocol: process.env.TYPESENSE_PROTOCOL,
            },
        ],
        apiKey: typesenseApiKey.value(),
    });
    const challengeId = context.params.challengeId;
    // Handle document deletion
    if (!change.after.exists) {
        try {
            await typesense.collections("challenges").documents(challengeId).delete();
            console.log(`Challenge ${challengeId} deleted from Typesense.`);
        }
        catch (error) {
            console.error(`Error deleting challenge ${challengeId} from Typesense:`, error);
        }
        return;
    }
    // Handle document creation or update
    const challengeData = change.after.data();
    if (challengeData) {
        try {
            await typesense
                .collections("challenges")
                .documents()
                .upsert(Object.assign({ id: challengeId }, challengeData));
            console.log(`Challenge ${challengeId} indexed in Typesense.`);
        }
        catch (error) {
            console.error(`Error indexing challenge ${challengeId} in Typesense:`, error);
        }
    }
});
//# sourceMappingURL=onChallengeWrite.js.map