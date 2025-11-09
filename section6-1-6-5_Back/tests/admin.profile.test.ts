import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
process.env.API_KEY = "dev-secret-change";

const mockPrisma = vi.hoisted(() => ({
  profile: {
    findFirst: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    profile = mockPrisma.profile;
  },
}));

beforeEach(() => {
  Object.values(mockPrisma.profile).forEach((fn: any) => fn.mockReset());
});

describe("Admin profile", () => {
  it("GET /api/admin/profile -> 401 なしヘッダ", async () => {
    const r = await request(app).get("/api/admin/profile");
    expect(r.status).toBe(401);
  });

  it("GET /api/admin/profile -> 200", async () => {
    mockPrisma.profile.findFirst.mockResolvedValueOnce({
      id: 1,
      name: "N",
      bio: "B",
      avatarId: null,
    });
    const r = await request(app)
      .get("/api/admin/profile")
      .set("x-api-key", "dev-secret-change");
    expect(r.status).toBe(200);
    expect(r.body.id).toBe(1);
  });

  it("DELETE /api/admin/profile/avatar -> 200（未作成でもOK）", async () => {
    mockPrisma.profile.findFirst.mockResolvedValueOnce(null);
    const r = await request(app)
      .delete("/api/admin/profile/avatar")
      .set("x-api-key", "dev-secret-change");
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
  });

  it("PUT /api/admin/profile -> 400（name/bio なし）", async () => {
    const r = await request(app)
      .put("/api/admin/profile")
      .set("x-api-key", "dev-secret-change")
      .send({});
    expect(r.status).toBe(400);
  });

  it("PUT /api/admin/profile -> 200（update or create）", async () => {
    mockPrisma.profile.findFirst.mockResolvedValueOnce({ id: 1 });
    mockPrisma.profile.update.mockResolvedValueOnce({
      id: 1,
      name: "N",
      bio: "B",
      avatarId: null,
    });
    const r = await request(app)
      .put("/api/admin/profile")
      .set("x-api-key", "dev-secret-change")
      .send({ name: "N", bio: "B" });
    expect(r.status).toBe(200);
    expect(r.body.id).toBe(1);
  });
});
