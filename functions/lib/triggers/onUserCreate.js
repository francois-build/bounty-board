import * as functions from 'firebase-functions';
import { search } from '../utils/search';
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL } = user;
    const userObject = {
        objectID: uid,
        email,
        displayName,
        photoURL,
    };
    const index = search.initIndex('users');
    await index.saveObject(userObject);
});
//# sourceMappingURL=onUserCreate.js.map