// section6-1-6-5_Back/tests/public.test.ts
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Prisma を軽量モック（vi.hoisted で先に束縛して TDZ を回避） ---
const mockPrisma = vi.hoisted(() => ({
  profile: { findFirst: vi.fn() },
  skill: { findMany: vi.fn() },
  project: { findMany: vi.fn() },
  contactMessage: { create: vi.fn() },
}));

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      // インスタンス生成時に評価されるプロパティ参照（hoisted済みなので安全）
      profile = mockPrisma.profile;
      skill = mockPrisma.skill;
      project = mockPrisma.project;
      contactMessage = mockPrisma.contactMessage;
    },
  };
});

// モックが効いた後で app を import
import app from "../src/app";

beforeEach(() => {
  mockPrisma.profile.findFirst.mockReset();
  mockPrisma.skill.findMany.mockReset();
  mockPrisma.project.findMany.mockReset();
  mockPrisma.contactMessage.create.mockReset();
});

describe("Public API", () => {
  it("GET /health -> 200 ok（正常系）", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.text).toBe("ok");
  });

  it("GET /api/public/home -> 必要データを返す（正常系）", async () => {
    mockPrisma.profile.findFirst.mockResolvedValueOnce({
      id: 1,
      name: "Kazue",
      bio: "フルスタック学習中",
      avatarId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: null,
    });
    mockPrisma.skill.findMany.mockResolvedValueOnce([
      {
        id: 1,
        name: "TypeScript",
        level: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    mockPrisma.project.findMany.mockResolvedValueOnce([
      {
        id: 2,
        title: "家計簿",
        description: "CRUDと集計",
        url: "https://example.com",
        imageId: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await request(app).get("/api/public/home");
    expect(res.status).toBe(200);
    expect(res.body.profile?.name).toBe("Kazue");
    expect(res.body.skills).toHaveLength(1);
    expect(res.body.projects[0].title).toBe("家計簿");
  });

  it("POST /api/public/contact -> バリデーションエラー（異常系）", async () => {
    const res = await request(app)
      .post("/api/public/contact")
      .send({ name: "", email: "", message: "" });
    expect(res.status).toBe(400);
  });

  it("POST /api/public/contact -> 200 ok（正常系）", async () => {
    mockPrisma.contactMessage.create.mockResolvedValueOnce({ id: 1 });
    const res = await request(app).post("/api/public/contact").send({
      name: "kazu",
      email: "k@example.com",
      message: "hi",
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
