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
exports.onusercreate = void 0;
const admin = __importStar(require("firebase-admin"));
const identity_1 = require("firebase-functions/v2/identity");
// This function triggers when a new user is created.
// We're using the onUserCreated trigger from the identity API.
exports.onusercreate = (0, identity_1.onUserCreated)(async (event) => {
    const user = event.data;
    const uid = user.uid;
    const email = user.email;
    const displayName = user.displayName;
    const photoURL = user.photoURL;
    // Prepare the user document to be stored in Firestore
    const userDocument = {
        uid,
        email,
        displayName,
        photoURL,
        // Initialize with default values, assuming they will be updated later
        status: 'active',
        roles: ['user'],
    };
    // Create the user document in the 'users' collection
    try {
        await admin.firestore().collection('users').doc(uid).set(userDocument);
        console.log(`Successfully created user document for UID: ${uid}`);
        // Log the creation event in the audit log
        const logEntry = {
            event: 'User Account Created',
            uid: uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: `New user signed up with email: ${email}`,
        };
        await admin.firestore().collection('audit_log').add(logEntry);
    }
    catch (error) {
        console.error(`Error creating user document or audit log for UID: ${uid}`, error);
        // Optional: Add more robust error handling, like sending a notification
    }
});
//# sourceMappingURL=onUserCreate.js.map