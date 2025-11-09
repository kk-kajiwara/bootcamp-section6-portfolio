// src/app/api/admin/profile/route.ts
import { ADMIN_UID, adminAuth } from "@/lib/firebaseAdmin";
import { serverFetch } from "@/lib/serverFetch";
import { cookies } from "next/headers";

/** 共通: セッションCookie検証（未認証=401 / UID不一致=403） */
async function ensureAdmin(): Promise<void> {
  const cookie = cookies().get("session")?.value;
  if (!cookie) throw new Response("unauthorized", { status: 401 });
  const d = await adminAuth.verifySessionCookie(cookie, true);
  if (d.uid !== ADMIN_UID) throw new Response("forbidden", { status: 403 });
}

/** 共通: serverFetch のエラーをHTTP応答に変換 */
function toErrorResponse(e: unknown): Response {
  const msg =
    typeof (e as any)?.message === "string"
      ? (e as any).message
      : "internal error";
  const m = msg.match(/API .* (\d{3}):/);
  const status = m ? Number(m[1]) : 500;
  return new Response(msg, { status });
}

/** GET /api/admin/profile */
export async function GET() {
  try {
    await ensureAdmin();
    const data = await serverFetch("/api/admin/profile", { method: "GET" });
    return Response.json(data);
  } catch (e) {
    if (e instanceof Response) return e; // ensureAdmin が投げた場合
    return toErrorResponse(e);
  }
}

/** DELETE /api/admin/profile/avatar  （アバター解除） */
export async function DELETE() {
  try {
    await ensureAdmin();
    const data = await serverFetch("/api/admin/profile/avatar", {
      method: "DELETE",
    });
    return Response.json(data);
  } catch (e) {
    if (e instanceof Response) return e;
    return toErrorResponse(e);
  }
}

/** PUT /api/admin/profile  （プロフィール作成/更新） */
export async function PUT(req: Request) {
  try {
    await ensureAdmin();
    const body = await req.json().catch(() => ({})); // { name, bio, avatarId? }
    const data = await serverFetch("/api/admin/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return Response.json(data);
  } catch (e) {
    if (e instanceof Response) return e;
    return toErrorResponse(e);
  }
}
