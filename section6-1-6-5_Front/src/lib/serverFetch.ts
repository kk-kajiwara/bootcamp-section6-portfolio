// src/lib/serverFetch.ts
// ① .env.local を明示的に読み込む（dev保険）
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * ② ローカル開発のフォールバックを用意
 *   - .env.local が読めなくてもとりあえず動かす
 *   - バックエンドのキー/ポートに合わせて必要ならここを変更
 */
const BASE = process.env.INTERNAL_API_BASE || "http://localhost:4000";
const KEY = process.env.INTERNAL_API_KEY || "dev-secret-change";

// Next.js の fetch 拡張用の型
type NextFetchOptions = RequestInit & {
  next?: { revalidate?: number; tags?: string[] };
};

export async function serverFetch<T>(
  path: string,
  init: RequestInit = {},
  revalidate?: number
): Promise<T> {
  // ③ revalidate があるときは cache を付けない（警告対策）
  const opts: NextFetchOptions = {
    ...(init as NextFetchOptions),
    headers: {
      "x-api-key": KEY,
      ...(init.headers || {}),
      ...(init.body ? { "content-type": "application/json" } : {}),
    },
  };
  if (revalidate !== undefined) {
    opts.next = { revalidate };
  } else {
    opts.cache = "no-store";
  }

  const url = `${BASE}${path}`;
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
