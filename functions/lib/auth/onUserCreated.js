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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreated = void 0;
const admin = __importStar(require("firebase-admin"));
const v1_1 = require("firebase-functions/v1");
exports.onUserCreated = v1_1.auth.user().onCreate(async (user) => {
    var _a, _b, _c, _d, _e;
    const db = admin.firestore();
    // Create user document in Firestore
    await db.doc(`users/${user.uid}`).set({
        uid: user.uid,
        email: (_a = user.email) !== null && _a !== void 0 ? _a : "",
        role: "alumni",
        displayName: (_d = (_b = user.displayName) !== null && _b !== void 0 ? _b : (_c = user.email) === null || _c === void 0 ? void 0 : _c.split("@")[0]) !== null && _d !== void 0 ? _d : "Alumni",
        photoURL: (_e = user.photoURL) !== null && _e !== void 0 ? _e : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        profileComplete: 0,
        batchYear: null,
        department: null,
        course: null,
        notifPrefs: { jobs: true, events: true },
    }, { merge: true });
    // Set custom claim: role = alumni
    await admin.auth().setCustomUserClaims(user.uid, { role: "alumni" });
    console.log(`User created: ${user.uid} (${user.email})`);
});
//# sourceMappingURL=onUserCreated.js.map