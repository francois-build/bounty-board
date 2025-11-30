import * as admin from 'firebase-admin';
admin.initializeApp();
export { onUserCreate } from './triggers/onUserCreate';
export { generateBridgeLink } from './triggers/generateBridgeLink';
export { nightlyGhostMatch } from './triggers/nightlyGhostMatch';
export { sendScoutInvite } from './triggers/sendScoutInvite';
export { onMilestoneRelease } from './triggers/onMilestoneRelease';
export { resolveShortLink } from './triggers/resolveShortLink';
export { onChallengeWrite } from './triggers/onChallengeWrite';
export { searchOrPivot } from './searchOrPivot';
//# sourceMappingURL=index.js.map