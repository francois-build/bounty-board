"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreate = void 0;
const functions = require("firebase-functions");
const search_1 = require("../utils/search");
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL } = user;
    const userObject = {
        objectID: uid,
        email,
        displayName,
        photoURL,
    };
    const index = search_1.search.initIndex('users');
    await index.saveObject(userObject);
});
//# sourceMappingURL=onUserCreate.js.map