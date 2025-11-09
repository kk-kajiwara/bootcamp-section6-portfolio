import { ADMIN_UID, adminAuth } from "@/lib/firebaseAdmin";
import { serverFetch } from "@/lib/serverFetch";
import { cookies } from "next/headers";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cookie = cookies().get("session")?.value;
  if (!cookie) return new Response("unauthorized", { status: 401 });
  const d = await adminAuth.verifySessionCookie(cookie, true);
  if (d.uid !== ADMIN_UID) return new Response("forbidden", { status: 403 });

  const body = await req.json();
  const data = await serverFetch(`/api/admin/skills/${params.id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return Response.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const cookie = cookies().get("session")?.value;
  if (!cookie) return new Response("unauthorized", { status: 401 });
  const d = await adminAuth.verifySessionCookie(cookie, true);
  if (d.uid !== ADMIN_UID) return new Response("forbidden", { status: 403 });

  const data = await serverFetch(`/api/admin/skills/${params.id}`, {
    method: "DELETE",
  });
  return Response.json(data);
}
