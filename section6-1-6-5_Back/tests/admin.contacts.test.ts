// section6-1-6-5_Back/tests/admin.contacts.test.ts
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

// Prisma 最小モック
vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      contactMessage = {
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        update: vi.fn().mockResolvedValue({ id: 1, status: "DONE" }),
        delete: vi.fn().mockResolvedValue({}),
      };
    },
  };
});

// env の API_KEY をテスト用に設定
process.env.API_KEY = "dev-secret-change";

import app from "../src/app";

describe("Admin Contacts", () => {
  it("GET /api/admin/contacts -> 401（ヘッダ無し異常系）", async () => {
    const r = await request(app).get("/api/admin/contacts");
    expect(r.status).toBe(401);
  });

  it("GET /api/admin/contacts -> 200（正常系）", async () => {
    const r = await request(app)
      .get("/api/admin/contacts?skip=0&take=10&status=ALL")
      .set("x-api-key", "dev-secret-change");
    expect(r.status).toBe(200);
    expect(r.body.items).toEqual([]);
    expect(r.body.total).toBe(0);
  });

  it("PATCH /api/admin/contacts/1 -> 200（正常系）", async () => {
    const r = await request(app)
      .patch("/api/admin/contacts/1")
      .set("x-api-key", "dev-secret-change")
      .send({ status: "DONE" });
    expect(r.status).toBe(200);
    expect(r.body.status).toBe("DONE");
  });

  it("PATCH /api/admin/contacts/x -> 400（異常系：id不正）", async () => {
    const r = await request(app)
      .patch("/api/admin/contacts/NaN")
      .set("x-api-key", "dev-secret-change")
      .send({ status: "DONE" });
    expect(r.status).toBe(400);
  });
});
