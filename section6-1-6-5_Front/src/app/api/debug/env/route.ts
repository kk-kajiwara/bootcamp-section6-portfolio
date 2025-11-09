// src/app/api/debug/env/route.ts
export async function GET() {
  return Response.json({
    INTERNAL_API_BASE: process.env.INTERNAL_API_BASE ?? "(env not set)",
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY
      ? "***set***"
      : "(env not set)",
    NODE_ENV: process.env.NODE_ENV,
  });
}
