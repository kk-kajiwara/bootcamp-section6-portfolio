import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
process.env.API_KEY = "dev-secret-change";

const mockPrisma = vi.hoisted(() => ({
  project: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    project = mockPrisma.project;
  },
}));

beforeEach(() => {
  Object.values(mockPrisma.project).forEach((fn: any) => fn.mockReset());
});

describe("Admin projects", () => {
  it("GET -> 200", async () => {
    mockPrisma.project.findMany.mockResolvedValueOnce([]);
    const r = await request(app)
      .get("/api/admin/projects")
      .set("x-api-key", "dev-secret-change");
    expect(r.status).toBe(200);
  });

  it("POST -> 400（必須欠落）", async () => {
    const r = await request(app)
      .post("/api/admin/projects")
      .set("x-api-key", "dev-secret-change")
      .send({});
    expect(r.status).toBe(400);
  });

  it("POST -> 200", async () => {
    mockPrisma.project.create.mockResolvedValueOnce({
      id: 10,
      title: "t",
      description: "d",
      url: null,
      imageId: null,
    });
    const r = await request(app)
      .post("/api/admin/projects")
      .set("x-api-key", "dev-secret-change")
      .send({ title: "t", description: "d" });
    expect(r.status).toBe(200);
    expect(r.body.id).toBe(10);
  });

  it("PUT -> 200", async () => {
    mockPrisma.project.update.mockResolvedValueOnce({
      id: 10,
      title: "t2",
      description: "d2",
      url: null,
      imageId: null,
    });
    const r = await request(app)
      .put("/api/admin/projects/10")
      .set("x-api-key", "dev-secret-change")
      .send({ title: "t2", description: "d2" });
    expect(r.status).toBe(200);
  });

  it("DELETE -> 200", async () => {
    mockPrisma.project.delete.mockResolvedValueOnce({});
    const r = await request(app)
      .delete("/api/admin/projects/10")
      .set("x-api-key", "dev-secret-change");
    expect(r.status).toBe(200);
  });
});
