// src/lib/firebaseAdmin.ts
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          // 改行を復元（.env.local は \n を含む1行文字列）
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
        }),
      });

export const adminAuth = getAuth(app);
export const ADMIN_UID = process.env.ADMIN_UID!;
