import * as admin from "firebase-admin";

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

export { onUserCreated } from "./auth/onUserCreated";
export { onJobPosted }   from "./notifications/onJobPosted";
export { onEventPosted } from "./notifications/onEventPosted";
export { generateReport } from "./reports/generateReport";
