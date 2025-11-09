// src/app/api/auth/login/route.ts
import { ADMIN_UID, adminAuth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { idToken } = await req.json().catch(() => ({}));
  if (!idToken) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const decoded = await adminAuth.verifyIdToken(idToken);
  if (decoded.uid !== ADMIN_UID) {
    return NextResponse.json({ error: "not admin" }, { status: 403 });
  }

  // 2日間のセッションCookieを発行
  const expiresIn = 1000 * 60 * 60 * 24 * 2;
  const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(expiresIn / 1000),
    sameSite: "lax",
  });
  return res;
}
