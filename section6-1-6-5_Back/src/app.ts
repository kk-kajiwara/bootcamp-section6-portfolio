// src/app.ts
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const API_KEY = process.env.API_KEY ?? "";

// 画像の base64 も通るようにボディ上限アップ
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// 内部APIキーで保護（Next 経由のみ許可）
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.header("x-api-key");
  if (!key || key !== API_KEY)
    return res.status(401).json({ error: "unauthorized" });
  next();
}

// ===== Prisma の内部型に依存しない受け口の型 =====
type AvatarRow = {
  data: Buffer | Uint8Array;
  contentType: string;
} | null;

type ProfileRow = {
  name: string;
  bio: string;
  avatar: AvatarRow;
} | null;

type ProjectRow = {
  id: number;
  title: string;
  description: string;
  url: string | null;
  image: AvatarRow;
};

// ヘルスチェック
app.get("/health", (_req: Request, res: Response) => {
  res.send("ok");
});

/* ======================
   公開API
   ====================== */

// トップ表示データ（プロフィール/スキル/実績）
app.get("/api/public/home", async (_req: Request, res: Response) => {
  const [profileRaw, skills, projectsRaw] = await Promise.all([
    prisma.profile.findFirst({ include: { avatar: true } }),
    prisma.skill.findMany({ orderBy: { level: "desc" } }),
    prisma.project.findMany({
      include: { image: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const profile: ProfileRow = profileRaw
    ? {
        name: profileRaw.name,
        bio: profileRaw.bio,
        avatar: profileRaw.avatar
          ? {
              data: profileRaw.avatar.data,
              contentType: profileRaw.avatar.contentType,
            }
          : null,
      }
    : null;

  type ProjectWithImage = (typeof projectsRaw)[number];
  const projects: ProjectRow[] = projectsRaw.map(
    (p: ProjectWithImage): ProjectRow => ({
      id: p.id,
      title: p.title,
      description: p.description,
      url: p.url,
      image: p.image
        ? { data: p.image.data, contentType: p.image.contentType }
        : null,
    })
  );

  const encode = (buf?: Uint8Array | Buffer, contentType?: string) =>
    buf && contentType
      ? `data:${contentType};base64,${Buffer.from(buf).toString("base64")}`
      : null;

  res.json({
    profile: profile
      ? {
          name: profile.name,
          bio: profile.bio,
          avatarUrl: profile.avatar
            ? encode(profile.avatar.data, profile.avatar.contentType)
            : null,
        }
      : null,
    skills,
    projects: projects.map((p: ProjectRow) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      url: p.url,
      imageUrl: p.image ? encode(p.image.data, p.image.contentType) : null,
    })),
  });
});

// 公開：問い合わせ保存
app.post("/api/public/contact", async (req: Request, res: Response) => {
  const { name, email, message } = req.body as {
    name: string;
    email: string;
    message: string;
  };
  if (!name || !email || !message)
    return res.status(400).json({ error: "bad request" });

  await prisma.contactMessage.create({
    data: { name, email, message }, // status は schema の @default(NEW)
  });

  res.json({ ok: true });
});

/* ======================
   管理：お問い合わせ（一覧/状態更新/削除）
   ====================== */

// 一覧（GET /api/admin/contacts?skip=0&take=20&status=ALL|NEW|DONE）
app.get(
  "/api/admin/contacts",
  requireApiKey,
  async (req: Request, res: Response) => {
    const skip = Number(req.query.skip ?? 0) || 0;
    const take = Math.min(Number(req.query.take ?? 20) || 20, 100);
    const statusParam = String(req.query.status ?? "ALL").toUpperCase();

    // Prisma の型差異を避けるため any で吸収（NEW/DONEのみ絞り込み）
    let where: any = undefined;
    if (statusParam === "NEW" || statusParam === "DONE") {
      where = { status: statusParam as any };
    }

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    res.json({ items, total, skip, take });
  }
);

// 状態更新（PATCH /api/admin/contacts/:id）
app.patch(
  "/api/admin/contacts/:id",
  requireApiKey,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body as { status: "NEW" | "DONE" };

    if (!id || (status !== "NEW" && status !== "DONE"))
      return res.status(400).json({ error: "bad request" });

    const updated = await prisma.contactMessage.update({
      where: { id },
      // ContactStatus の TS 型差異を吸収
      data: { status: status as any } as any,
    });

    res.json(updated);
  }
);

// 削除（DELETE /api/admin/contacts/:id）
app.delete(
  "/api/admin/contacts/:id",
  requireApiKey,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "bad request" });
    await prisma.contactMessage.delete({ where: { id } });
    res.json({ ok: true });
  }
);

/* ======================
   管理：画像 / プロフィール / スキル / 実績
   ====================== */

// 画像(BLOB)アップロード
app.post(
  "/api/admin/images",
  requireApiKey,
  async (req: Request, res: Response) => {
    const { filename, contentType, base64 } = req.body as {
      filename: string;
      contentType: string;
      base64: string;
    };
    if (!filename || !contentType || !base64)
      return res.status(400).json({ error: "bad request" });

    const data = Buffer.from(base64, "base64");
    const image = await prisma.image.create({
      data: { filename, contentType, data, size: data.length },
    });
    res.json({ id: image.id });
  }
);

/* ---- プロフィール ---- */

// 取得（GET /api/admin/profile）
app.get(
  "/api/admin/profile",
  requireApiKey,
  async (_req: Request, res: Response) => {
    const p = await prisma.profile.findFirst({ include: { avatar: true } });
    res.json(p);
  }
);

// アバター解除（DELETE /api/admin/profile/avatar）
app.delete(
  "/api/admin/profile/avatar",
  requireApiKey,
  async (_req: Request, res: Response) => {
    const cur = await prisma.profile.findFirst();
    if (!cur) return res.json({ ok: true });
    const saved = await prisma.profile.update({
      where: { id: cur.id },
      data: { avatarId: null },
    });
    res.json(saved);
  }
);

// 作成/更新（PUT /api/admin/profile）
app.put(
  "/api/admin/profile",
  requireApiKey,
  async (req: Request, res: Response) => {
    const { name, bio, avatarId } = req.body as {
      name: string;
      bio: string;
      avatarId?: number | null;
    };
    if (!name || !bio) return res.status(400).json({ error: "bad request" });

    const current = await prisma.profile.findFirst();

    const saved = current
      ? await prisma.profile.update({
          where: { id: current.id },
          data: { name, bio, avatarId: avatarId ?? null },
        })
      : await prisma.profile.create({
          data: { name, bio, avatarId: avatarId ?? null },
        });

    res.json(saved);
  }
);

/* ---- スキル ---- */

// 一覧（GET /api/admin/skills）
app.get(
  "/api/admin/skills",
  requireApiKey,
  async (_req: Request, res: Response) => {
    const items = await prisma.skill.findMany({ orderBy: { id: "asc" } });
    res.json(items);
  }
);

// 追加（POST /api/admin/skills）
app.post(
  "/api/admin/skills",
  requireApiKey,
  async (req: Request, res: Response) => {
    const { name, level } = req.body as { name: string; level: number };
    if (!name || level === undefined || level === null)
      return res.status(400).json({ error: "bad request" });

    const skill = await prisma.skill.create({
      data: { name, level: Number(level) },
    });
    res.json(skill);
  }
);

// 更新（PUT /api/admin/skills/:id）
app.put(
  "/api/admin/skills/:id",
  requireApiKey,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, level } = req.body as { name: string; level: number };
    if (!id || !name || level === undefined || level === null)
      return res.status(400).json({ error: "bad request" });
    const saved = await prisma.skill.update({
      where: { id },
      data: { name, level: Number(level) },
    });
    res.json(saved);
  }
);

// 削除（DELETE /api/admin/skills/:id）
app.delete(
  "/api/admin/skills/:id",
  requireApiKey,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "bad request" });
    await prisma.skill.delete({ where: { id } });
    res.json({ ok: true });
  }
);

/* ---- 実績（プロジェクト） ---- */

// 一覧（GET /api/admin/projects）
app.get(
  "/api/admin/projects",
  requireApiKey,
  async (_req: Request, res: Response) => {
    const items = await prisma.project.findMany({
      include: { image: true },
      orderBy: { id: "desc" },
    });
    res.json(items);
  }
);

// 追加（POST /api/admin/projects）
app.post(
  "/api/admin/projects",
  requireApiKey,
  async (req: Request, res: Response) => {
    const { title, description, url, imageId } = req.body as {
      title: string;
      description: string;
      url?: string | null;
      imageId?: number | null;
    };
    if (!title || !description)
      return res.status(400).json({ error: "bad request" });

    const proj = await prisma.project.create({
      data: {
        title,
        description,
        url: url ?? null,
        imageId: imageId ?? null,
      },
    });
    res.json(proj);
  }
);

// 更新（PUT /api/admin/projects/:id）
app.put(
  "/api/admin/projects/:id",
  requireApiKey,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { title, description, url, imageId } = req.body as {
      title: string;
      description: string;
      url?: string | null;
      imageId?: number | null;
    };
    if (!id || !title || !description)
      return res.status(400).json({ error: "bad request" });
    const saved = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        url: url ?? null,
        imageId: imageId ?? null,
      },
    });
    res.json(saved);
  }
);

// 削除（DELETE /api/admin/projects/:id）
app.delete(
  "/api/admin/projects/:id",
  requireApiKey,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "bad request" });
    await prisma.project.delete({ where: { id } });
    res.json({ ok: true });
  }
);

export default app;
