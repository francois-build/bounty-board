"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = void 0;
const algoliasearch_1 = __importDefault(require("algoliasearch"));
// TODO: Replace with your Algolia credentials
const ALGOLIA_APP_ID = 'REPLACE_WITH_YOUR_ALGOLIA_APP_ID';
const ALGOLIA_API_KEY = 'REPLACE_WITH_YOUR_ALGOLIA_API_KEY';
exports.search = (0, algoliasearch_1.default)(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
//# sourceMappingURL=search.js.map