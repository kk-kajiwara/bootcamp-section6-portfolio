// src/app/api/public/home/route.ts
import { serverFetch } from "@/lib/serverFetch";

export async function GET() {
  const data = await serverFetch("/api/public/home", { method: "GET" }, 5);
  return Response.json(data);
}
