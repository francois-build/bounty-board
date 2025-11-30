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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
// Mock the entire OpenAI module
vitest_1.vi.mock('openai', () => {
    const mockCompletions = {
        create: vitest_1.vi.fn(),
    };
    return {
        default: vitest_1.vi.fn().mockImplementation(() => {
            return {
                completions: mockCompletions,
            };
        }),
    };
});
const sanitizeInputs_1 = require("./sanitizeInputs");
const testEnv = (0, firebase_functions_test_1.default)();
(0, vitest_1.describe)('sanitizeInputs', () => {
    const wrapped = testEnv.wrap(sanitizeInputs_1.sanitizeInputs);
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should allow the write and log a warning if OpenAI fails', async () => {
        // Simulate an authenticated user
        const context = { auth: { uid: 'test-user' } };
        const data = {
            goal: 'Test Goal',
            problem: 'Test Problem',
            solution: 'Test Solution',
        };
        // Mock a 500 error from the OpenAI API
        const openai = await Promise.resolve().then(() => __importStar(require('openai')));
        const mockCreate = openai.default.prototype.completions.create;
        mockCreate.mockRejectedValue(new Error('OpenAI API is down'));
        const result = await wrapped(data, context);
        // Check that the write proceeds (a challenge ID is returned)
        (0, vitest_1.expect)(result.challengeId).toBeDefined();
        // You would also want to check your logs to ensure the warning was logged.
    });
});
//# sourceMappingURL=sanitizeInputs.test.js.map