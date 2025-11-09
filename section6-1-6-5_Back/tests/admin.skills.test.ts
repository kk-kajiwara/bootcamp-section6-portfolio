import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
process.env.API_KEY = "dev-secret-change";

const mockPrisma = vi.hoisted(() => ({
  skill: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    skill = mockPrisma.skill;
  },
}));

beforeEach(() => {
  Object.values(mockPrisma.skill).forEach((fn: any) => fn.mockReset());
});

describe("Admin skills", () => {
  it("GET -> 200", async () => {
    mockPrisma.skill.findMany.mockResolvedValueOnce([]);
    const r = await request(app)
      .get("/api/admin/skills")
      .set("x-api-key", "dev-secret-change");
    expect(r.status).toBe(200);
  });

  it("POST -> 400（必須欠落）", async () => {
    const r = await request(app)
      .post("/api/admin/skills")
      .set("x-api-key", "dev-secret-change")
      .send({ name: "TS" });
    expect(r.status).toBe(400);
  });

  it("POST -> 200", async () => {
    mockPrisma.skill.create.mockResolvedValueOnce({
      id: 1,
      name: "TS",
      level: 5,
    });
    const r = await request(app)
      .post("/api/admin/skills")
      .set("x-api-key", "dev-secret-change")
      .send({ name: "TS", level: 5 });
    expect(r.status).toBe(200);
    expect(r.body.id).toBe(1);
  });

  it("PUT -> 200", async () => {
    mockPrisma.skill.update.mockResolvedValueOnce({
      id: 1,
      name: "TS",
      level: 4,
    });
    const r = await request(app)
      .put("/api/admin/skills/1")
      .set("x-api-key", "dev-secret-change")
      .send({ name: "TS", level: 4 });
    expect(r.status).toBe(200);
  });

  it("DELETE -> 200", async () => {
    mockPrisma.skill.delete.mockResolvedValueOnce({});
    const r = await request(app)
      .delete("/api/admin/skills/1")
      .set("x-api-key", "dev-secret-change");
    expect(r.status).toBe(200);
  });
});
