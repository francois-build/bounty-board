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
exports.onChallengeWrite = exports.resolveShortLink = exports.onMilestoneRelease = exports.sendScoutInvite = exports.nightlyGhostMatch = exports.generateBridgeLink = exports.onUserCreate = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
var onUserCreate_1 = require("./triggers/onUserCreate");
Object.defineProperty(exports, "onUserCreate", { enumerable: true, get: function () { return onUserCreate_1.onUserCreate; } });
var generateBridgeLink_1 = require("./triggers/generateBridgeLink");
Object.defineProperty(exports, "generateBridgeLink", { enumerable: true, get: function () { return generateBridgeLink_1.generateBridgeLink; } });
var nightlyGhostMatch_1 = require("./triggers/nightlyGhostMatch");
Object.defineProperty(exports, "nightlyGhostMatch", { enumerable: true, get: function () { return nightlyGhostMatch_1.nightlyGhostMatch; } });
var sendScoutInvite_1 = require("./triggers/sendScoutInvite");
Object.defineProperty(exports, "sendScoutInvite", { enumerable: true, get: function () { return sendScoutInvite_1.sendScoutInvite; } });
var onMilestoneRelease_1 = require("./triggers/onMilestoneRelease");
Object.defineProperty(exports, "onMilestoneRelease", { enumerable: true, get: function () { return onMilestoneRelease_1.onMilestoneRelease; } });
var resolveShortLink_1 = require("./triggers/resolveShortLink");
Object.defineProperty(exports, "resolveShortLink", { enumerable: true, get: function () { return resolveShortLink_1.resolveShortLink; } });
var onChallengeWrite_1 = require("./triggers/onChallengeWrite");
Object.defineProperty(exports, "onChallengeWrite", { enumerable: true, get: function () { return onChallengeWrite_1.onChallengeWrite; } });
//# sourceMappingURL=index.js.map