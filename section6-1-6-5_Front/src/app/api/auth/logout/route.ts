// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // セッションCookie(session)を失効させる
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "", {
    path: "/",
    maxAge: 0, // 即時失効
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

// Vercel などでキャッシュされないように（任意）
export const dynamic = "force-dynamic";
