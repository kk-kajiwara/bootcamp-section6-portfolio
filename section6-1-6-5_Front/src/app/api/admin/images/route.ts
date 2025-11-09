import { ADMIN_UID, adminAuth } from "@/lib/firebaseAdmin";
import { serverFetch } from "@/lib/serverFetch";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 認証チェック
    const cookie = cookies().get("session")?.value;
    if (!cookie) return new Response("unauthorized", { status: 401 });
    const d = await adminAuth.verifySessionCookie(cookie, true);
    if (d.uid !== ADMIN_UID) return new Response("forbidden", { status: 403 });

    // 画像本体（base64）を受け取ってバックにそのまま中継
    const body = await req.json(); // { filename, contentType, base64 } のはず

    // バックエンドへ
    const data = await serverFetch<{ id: number }>("/api/admin/images", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return Response.json(data);
  } catch (e: any) {
    // serverFetch は "API /path 400: <text>" のような message を投げる
    const msg = typeof e?.message === "string" ? e.message : "internal error";
    // 可能ならステータスを抽出（無理なら 500）
    const m = msg.match(/API .* (\d{3}):/);
    const status = m ? Number(m[1]) : 500;
    return new Response(msg, { status });
  }
}
