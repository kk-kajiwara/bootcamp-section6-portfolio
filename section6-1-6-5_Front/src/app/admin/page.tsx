"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminTop() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) router.push("/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">管理メニュー</h2>
          <div className="space-x-2">
            <Link
              href="/admin"
              className="btn btn-secondary px-3 py-2 rounded-md"
            >
              ダッシュボード
            </Link>
            <Link
              href="/admin/contacts"
              className="btn btn-secondary px-3 py-2 rounded-md"
            >
              お問い合わせ一覧
            </Link>
            <button
              onClick={onLogout}
              disabled={busy}
              className="btn btn-primary px-3 py-2 rounded-md"
            >
              ログアウト
            </button>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="font-bold text-gray-800">プロフィール</h3>
          <p className="text-gray-600 mt-1 text-sm">
            名前・自己紹介・アバター画像を編集します。
          </p>
          <Link
            href="/admin/profile"
            className="inline-block mt-3 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          >
            プロフィール編集
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="font-bold text-gray-800">スキル</h3>
          <p className="text-gray-600 mt-1 text-sm">
            追加・編集・削除ができます。
          </p>
          <Link
            href="/admin/skills"
            className="inline-block mt-3 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          >
            スキル管理
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="font-bold text-gray-800">実績</h3>
          <p className="text-gray-600 mt-1 text-sm">
            追加・編集・削除ができます。
          </p>
          <Link
            href="/admin/projects"
            className="inline-block mt-3 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          >
            実績管理
          </Link>
        </div>
      </section>
    </main>
  );
}
