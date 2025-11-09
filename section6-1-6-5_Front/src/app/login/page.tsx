// src/app/login/page.tsx
"use client";
import { authClient } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const cred = await signInWithEmailAndPassword(
        authClient,
        email,
        password
      );
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin");
    } catch (e: any) {
      setErr(
        "ログインに失敗しました。メールまたはパスワードを確認してください。"
      );
    }
  }

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
        {err && <p className="text-red-600 mb-4">{err}</p>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            placeholder="メールアドレス"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <button type="submit" className="btn btn-primary w-full">
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}
