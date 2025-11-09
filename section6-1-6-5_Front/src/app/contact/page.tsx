// src/app/contact/page.tsx
"use client";
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // ハニーポット（人間は触らない隠し項目）
  const [company, setCompany] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // ハニーポットに値が入っていたら送信しない
    if (company.trim()) {
      setError("送信に失敗しました。再度お試しください。");
      return;
    }

    if (!form.name) return setError("お名前を入力してください");
    if (!form.email) return setError("メールアドレスを入力してください");
    if (!form.message) return setError("メッセージを入力してください");

    try {
      setBusy(true);
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setDone(true);
      } else {
        setError("送信に失敗しました。再度お試しください。");
      }
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4">お問い合わせ</h1>
          <p className="text-green-600">送信しました！</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">お問い合わせ</h1>
        {error && (
          <p id="form-error" className="text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <label className="block">
            <span className="sr-only">お名前</span>
            <input
              placeholder="お名前"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded p-2 w-full input"
              required
              aria-invalid={!!error && !form.name}
              aria-describedby={
                !!error && !form.name ? "form-error" : undefined
              }
            />
          </label>

          <label className="block">
            <span className="sr-only">メールアドレス</span>
            <input
              type="email"
              placeholder="メールアドレス"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border rounded p-2 w-full input"
              required
              aria-invalid={!!error && !form.email}
              aria-describedby={
                !!error && !form.email ? "form-error" : undefined
              }
            />
          </label>

          <label className="block">
            <span className="sr-only">メッセージ</span>
            <textarea
              rows={5}
              placeholder="メッセージ"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="border rounded p-2 w-full input"
              required
              aria-invalid={!!error && !form.message}
              aria-describedby={
                !!error && !form.message ? "form-error" : undefined
              }
            />
          </label>

          {/* ハニーポット（見えない・フォーカス不可） */}
          <input
            type="text"
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? "送信中…" : "送信"}
          </button>
        </form>
      </div>
    </main>
  );
}
