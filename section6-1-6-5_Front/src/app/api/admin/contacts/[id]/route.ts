// src/app/api/admin/contacts/[id]/route.ts
import { ADMIN_UID, adminAuth } from "@/lib/firebaseAdmin";
import { serverFetch } from "@/lib/serverFetch";
import { cookies } from "next/headers";

async function ensureAdmin(): Promise<Response | null> {
  const cookie = cookies().get("session")?.value;
  if (!cookie) return new Response("not found", { status: 404 });
  try {
    const d = await adminAuth.verifySessionCookie(cookie, true);
    if (d.uid !== ADMIN_UID) return new Response("not found", { status: 404 });
    return null;
  } catch {
    return new Response("not found", { status: 404 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await ensureAdmin();
  if (guard) return guard;

  const body = await req.json(); // { status: "NEW" | "DONE" }
  const data = await serverFetch(`/api/admin/contacts/${params.id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return Response.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await ensureAdmin();
  if (guard) return guard;

  const data = await serverFetch(`/api/admin/contacts/${params.id}`, {
    method: "DELETE",
  });
  return Response.json(data);
}
