import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
process.env.API_KEY = "dev-secret-change";

const mockPrisma = vi.hoisted(() => ({
  image: { create: vi.fn() },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    image = mockPrisma.image;
  },
}));

beforeEach(() => {
  mockPrisma.image.create.mockReset();
});

describe("Admin images", () => {
  it("POST /api/admin/images -> 401 (ヘッダなし)", async () => {
    const r = await request(app).post("/api/admin/images").send({});
    expect(r.status).toBe(401);
  });

  it("POST /api/admin/images -> 400 (必須不足)", async () => {
    const r = await request(app)
      .post("/api/admin/images")
      .set("x-api-key", "dev-secret-change")
      .send({ filename: "a.png", contentType: "image/png" });
    expect(r.status).toBe(400);
  });

  it("POST /api/admin/images -> 200 (成功)", async () => {
    mockPrisma.image.create.mockResolvedValueOnce({ id: 123 });
    const r = await request(app)
      .post("/api/admin/images")
      .set("x-api-key", "dev-secret-change")
      .send({ filename: "a.png", contentType: "image/png", base64: "YWJj" });
    expect(r.status).toBe(200);
    expect(r.body.id).toBe(123);
  });
});
