// src/app/api/public/contact/route.ts
import { serverFetch } from "@/lib/serverFetch";

export async function POST(req: Request) {
  const body = await req.json();
  const data = await serverFetch("/api/public/contact", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return Response.json(data);
}
