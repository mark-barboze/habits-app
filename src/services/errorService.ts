/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from '../lib/firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };

  // Specific check for unauthorized domains
  if (errorMessage.includes('auth/unauthorized-domain')) {
    const currentDomain = window.location.hostname;
    console.error(`CRITICAL: Domain "${currentDomain}" not authorized in Firebase Console.`);
    console.error(`Please add "${currentDomain}" to Authentication > Settings > Authorized domains in your Firebase project (habits-11ca1).`);
  }
  
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorJson);
  
  // Custom error with JSON message for the system to diagnose
  throw new Error(errorJson);
}
