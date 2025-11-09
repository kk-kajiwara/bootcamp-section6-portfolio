// section6-1-6-5_Front/src/app/page.test.tsx
import { expect, it, vi } from "vitest";

// サーバーコンポーネントはユニットテストが難しいため、
// ここでは fetch のエラーパスを単体関数化するとテストが楽です。
// 例：データ整形関数を export してそこをテストする、など。
// 簡易的には fetch が throw する挙動を確認するだけに留める実例。
vi.mock("next/headers", () => ({
  headers: () =>
    new Map([
      ["x-forwarded-proto", "http"],
      ["host", "localhost:3000"],
    ]),
}));

it("Home: /api/public/home が 500 のとき throw（異常系の想定）", async () => {
  (global as any).fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 });
  const mod = await import("./page");
  await expect(mod.default()).rejects.toThrowError(/failed to load home: 500/);
});
