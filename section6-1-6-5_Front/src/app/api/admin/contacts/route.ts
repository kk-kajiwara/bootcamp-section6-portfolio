// src/app/api/admin/contacts/route.ts
import { ADMIN_UID, adminAuth } from "@/lib/firebaseAdmin";
import { serverFetch } from "@/lib/serverFetch";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  // 認証（未認証・別UIDなら 404 で隠す要件）
  const cookie = cookies().get("session")?.value;
  if (!cookie) return new Response("not found", { status: 404 });
  try {
    const d = await adminAuth.verifySessionCookie(cookie, true);
    if (d.uid !== ADMIN_UID) return new Response("not found", { status: 404 });
  } catch {
    return new Response("not found", { status: 404 });
  }

  // クエリをそのままバックへ転送
  const url = new URL(req.url);
  const qs = url.search ? url.search : "";
  const data = await serverFetch(`/api/admin/contacts${qs}`, { method: "GET" });
  return Response.json(data);
}
