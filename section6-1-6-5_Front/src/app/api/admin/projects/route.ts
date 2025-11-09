// src/app/api/admin/projects/route.ts
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

/** GET /api/admin/projects  → BEへ中継 */
export async function GET() {
  try {
    await ensureAdmin();
    const data = await serverFetch("/api/admin/projects", { method: "GET" });
    return Response.json(data);
  } catch (e) {
    if (e instanceof Response) return e;
    return toErrorResponse(e);
  }
}

/** POST /api/admin/projects  → BEへ中継（追加） */
export async function POST(req: Request) {
  try {
    await ensureAdmin();
    // { title: string; description: string; url?: string|null; imageId?: number|null }
    const body = await req.json().catch(() => ({}));
    const data = await serverFetch("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return Response.json(data);
  } catch (e) {
    if (e instanceof Response) return e;
    return toErrorResponse(e);
  }
}
