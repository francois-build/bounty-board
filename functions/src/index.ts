/**
 * Copyright (c) 2025 Bounty Solutions Inc.
 * All Rights Reserved.
 * This code is proprietary and confidential.
 */

import * as admin from 'firebase-admin';

admin.initializeApp();

// Temporarily isolating to validate the fix for searchOrPivot
export { searchOrPivot } from './searchOrPivot';
