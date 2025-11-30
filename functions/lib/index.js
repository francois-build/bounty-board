"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveShortLink = exports.onMilestoneRelease = exports.sendScoutInvite = exports.nightlyGhostMatch = exports.generateBridgeLink = exports.onUserCreate = void 0;
const admin = require("firebase-admin");
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
//# sourceMappingURL=index.js.map