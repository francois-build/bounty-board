"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resend = void 0;
const resend_1 = require("resend");
// TODO: Replace with your Resend API key
const RESEND_API_KEY = 'REPLACE_WITH_YOUR_RESEND_API_KEY';
exports.resend = new resend_1.Resend(RESEND_API_KEY);
//# sourceMappingURL=email.js.map