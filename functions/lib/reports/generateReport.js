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
exports.generateReport = void 0;
const admin = __importStar(require("firebase-admin"));
const v1_1 = require("firebase-functions/v1");
exports.generateReport = v1_1.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new v1_1.https.HttpsError("unauthenticated", "Must be authenticated.");
    }
    const tokenRole = context.auth.token.role;
    if (tokenRole !== "admin") {
        throw new v1_1.https.HttpsError("permission-denied", "Admin access required.");
    }
    const db = admin.firestore();
    let q = db.collection("users").where("role", "==", "alumni");
    if (data.department)
        q = q.where("department", "==", data.department);
    if (data.batchYear)
        q = q.where("batchYear", "==", data.batchYear);
    const snap = await q.get();
    const rows = snap.docs.map((d) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const a = d.data();
        return {
            uid: d.id,
            name: (_a = a.displayName) !== null && _a !== void 0 ? _a : "",
            email: (_b = a.email) !== null && _b !== void 0 ? _b : "",
            department: (_c = a.department) !== null && _c !== void 0 ? _c : "",
            course: (_d = a.course) !== null && _d !== void 0 ? _d : "",
            batchYear: (_e = a.batchYear) !== null && _e !== void 0 ? _e : "",
            profileComplete: (_f = a.profileComplete) !== null && _f !== void 0 ? _f : 0,
            createdAt: (_g = a.createdAt) !== null && _g !== void 0 ? _g : "",
        };
    });
    return { rows, total: rows.length };
});
//# sourceMappingURL=generateReport.js.map