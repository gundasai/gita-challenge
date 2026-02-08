import * as admin from 'firebase-admin';

try {
    if (!admin.apps.length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (privateKey && clientEmail && projectId) {
            console.log("Attempting to initialize Firebase Admin with Env Vars...");
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, '\n'),
                }),
            });
            console.log("Firebase Admin initialized with Env Vars.");
        } else {
            console.log("Env vars missing, attempting service-account.json fallback...");
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const serviceAccount = require('../../service-account.json');
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("Firebase Admin initialized with service-account.json.");
            } catch (fileError) {
                console.error("Failed to load service-account.json:", fileError);
                throw new Error("Firebase Admin Initialization Failed: Missing Env Vars and service-account.json failed.");
            }
        }
    }
} catch (error: any) {
    console.error("CRITICAL: Firebase Admin Initialization Error:", error);
}

// Safely export auth and db. If init failed, these will be undefined/null.
// The API routes must check if they are defined before using them.
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
