
import admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

let adminApp: admin.app.App;

export async function getFirebaseAdmin() {
  if (!serviceAccount) {
    throw new Error('Firebase service account key is not available. Set the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
  }

  if (!adminApp) {
    try {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error: any) {
      if (error.code === 'app/duplicate-app') {
         adminApp = admin.app();
      } else {
        console.error('Failed to initialize Firebase Admin SDK:', error);
        throw error;
      }
    }
  }

  return adminApp;
}
