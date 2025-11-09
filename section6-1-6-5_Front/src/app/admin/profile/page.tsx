"use client";
import { useEffect, useState } from "react";

type Profile = {
  id: number;
  name: string;
  bio: string;
  avatarId: number | null;
  avatar?: { id: number } | null;
};

async function fileToBase64(file: File) {
  const buf = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return { contentType: file.type || "application/octet-stream", base64 };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/profile", { cache: "no-store" });
      if (r.ok) {
        const p = (await r.json()) as Profile | null;
        setProfile(p);
        if (p) {
          setName(p.name);
          setBio(p.bio);
        }
      }
    })();
  }, []);

  function addLog(s: string) {
    setLog((p) => (p ? p + "\n" : "") + s);
  }

  async function onSave() {
    try {
      let avatarId: number | null | undefined = profile?.avatarId ?? null;
      if (file) {
        addLog("画像アップロード中…");
        const { contentType, base64 } = await fileToBase64(file);
        const up = await fetch("/api/admin/images", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType, base64 }),
        });
        if (!up.ok) throw new Error(await up.text());
        const j = (await up.json()) as { id: number };
        avatarId = j.id;
        addLog(`画像アップロード完了 (imageId=${j.id})`);
      }
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, bio, avatarId }),
      });
      if (!res.ok) throw new Error(await res.text());
      addLog("✅ 保存しました");
    } catch (e: any) {
      addLog(`❌ 失敗: ${e?.message ?? e}`);
    }
  }

  async function onRemoveAvatar() {
    const r = await fetch("/api/admin/profile", { cache: "no-store" });
    if (!r.ok) return;
    const p = (await r.json()) as Profile | null;
    if (!p) return;
    await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: p.name, bio: p.bio, avatarId: null }),
    });
    setFile(null);
    setProfile({ ...p, avatarId: null });
    addLog("🧹 アバターを解除しました");
  }

  return (
    <main className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">プロフィール編集</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-3">
        <input
          className="w-full border rounded-md px-3 py-2"
          placeholder="お名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full border rounded-md px-3 py-2"
          rows={5}
          placeholder="自己紹介"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <div className="flex gap-3 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className="px-3 py-2 rounded-md bg-gray-200"
            onClick={onRemoveAvatar}
          >
            アバターを外す
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={onSave}
          >
            保存
          </button>
        </div>

        <pre className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
          {log}
        </pre>
      </div>
    </main>
  );
}
