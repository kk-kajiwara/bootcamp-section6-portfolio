// section6-1-6-5_Back/tests/public.encode.test.ts
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Prisma を軽量モック（画像ありパターンを返せるように）
const mockPrisma = vi.hoisted(() => ({
  profile: { findFirst: vi.fn() },
  skill: { findMany: vi.fn() },
  project: { findMany: vi.fn() },
  contactMessage: { create: vi.fn() },
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    profile = mockPrisma.profile;
    skill = mockPrisma.skill;
    project = mockPrisma.project;
    contactMessage = mockPrisma.contactMessage;
  },
}));

import app from "../src/app";

beforeEach(() => {
  mockPrisma.profile.findFirst.mockReset();
  mockPrisma.skill.findMany.mockReset();
  mockPrisma.project.findMany.mockReset();
  mockPrisma.contactMessage.create.mockReset();
});

describe("Public home with images (base64 encode)", () => {
  it("avatarUrl / imageUrl が data:...;base64, で返る（正常系）", async () => {
    mockPrisma.profile.findFirst.mockResolvedValueOnce({
      id: 1,
      name: "Kazue",
      bio: "bio",
      avatarId: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: {
        id: 99,
        filename: "a.png",
        contentType: "image/png",
        data: Buffer.from("abc"),
        size: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    mockPrisma.skill.findMany.mockResolvedValueOnce([]);
    mockPrisma.project.findMany.mockResolvedValueOnce([
      {
        id: 2,
        title: "P",
        description: "D",
        url: null,
        imageId: 77,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: {
          id: 77,
          filename: "p.jpg",
          contentType: "image/jpeg",
          data: Buffer.from("xyz"),
          size: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ]);

    const r = await request(app).get("/api/public/home");
    expect(r.status).toBe(200);
    expect(r.body.profile.avatarUrl).toMatch(/^data:image\/png;base64,/);
    expect(r.body.projects[0].imageUrl).toMatch(/^data:image\/jpeg;base64,/);
  });
});
