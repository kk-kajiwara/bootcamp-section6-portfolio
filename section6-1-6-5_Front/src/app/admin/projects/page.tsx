"use client";
import { useEffect, useMemo, useState } from "react";

type Project = {
  id: number;
  title: string;
  description: string;
  url: string | null;
  imageId: number | null;
};

async function fileToBase64(file: File) {
  const buf = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return { contentType: file.type || "application/octet-stream", base64 };
}

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState("");

  function addLog(s: string) {
    setLog((p) => (p ? p + "\n" : "") + s);
  }

  async function load() {
    const r = await fetch("/api/admin/projects", { cache: "no-store" });
    if (r.ok) setItems(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    try {
      let imageId: number | null = null;
      if (file) {
        const { contentType, base64 } = await fileToBase64(file);
        const res = await fetch("/api/admin/images", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType, base64 }),
        });
        if (!res.ok) throw new Error(await res.text());
        const j = (await res.json()) as { id: number };
        imageId = j.id;
      }
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          description: desc,
          url: url || null,
          imageId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTitle("");
      setDesc("");
      setUrl("");
      setFile(null);
      await load();
    } catch (e: any) {
      addLog(`❌ 追加失敗: ${e?.message ?? e}`);
    }
  }

  async function save(it: Project, newFile: File | null) {
    try {
      let imageId = it.imageId ?? null;
      if (newFile) {
        const { contentType, base64 } = await fileToBase64(newFile);
        const res = await fetch("/api/admin/images", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ filename: newFile.name, contentType, base64 }),
        });
        if (!res.ok) throw new Error(await res.text());
        const j = (await res.json()) as { id: number };
        imageId = j.id;
      }
      const res = await fetch(`/api/admin/projects/${it.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: it.title,
          description: it.description,
          url: it.url,
          imageId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e: any) {
      addLog(`❌ 更新失敗: ${e?.message ?? e}`);
    }
  }

  async function del(id: number) {
    if (!confirm("削除しますか？")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (!res.ok) addLog("❌ 削除失敗");
    await load();
  }

  // 一覧（編集可能セル＋画像差し替え）
  const rows = useMemo(
    () =>
      items.map((it) => {
        let tempFile: File | null = null;
        return (
          <tr key={it.id} className="border-t">
            <td className="px-2 py-2 text-gray-500">{it.id}</td>
            <td className="px-2 py-2">
              <input
                className="border rounded px-2 py-1 w-full"
                value={it.title}
                onChange={(e) =>
                  setItems((arr) =>
                    arr.map((x) =>
                      x.id === it.id ? { ...x, title: e.target.value } : x
                    )
                  )
                }
              />
            </td>
            <td className="px-2 py-2">
              <textarea
                className="border rounded px-2 py-1 w-full"
                rows={2}
                value={it.description}
                onChange={(e) =>
                  setItems((arr) =>
                    arr.map((x) =>
                      x.id === it.id ? { ...x, description: e.target.value } : x
                    )
                  )
                }
              />
            </td>
            <td className="px-2 py-2">
              <input
                className="border rounded px-2 py-1 w-full"
                value={it.url ?? ""}
                onChange={(e) =>
                  setItems((arr) =>
                    arr.map((x) =>
                      x.id === it.id ? { ...x, url: e.target.value } : x
                    )
                  )
                }
              />
            </td>
            <td className="px-2 py-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => (tempFile = e.target.files?.[0] ?? null)}
              />
            </td>
            <td className="px-2 py-2 space-x-2">
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => save(it, tempFile)}
              >
                更新
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={() => del(it.id)}
              >
                削除
              </button>
            </td>
          </tr>
        );
      }),
    [items]
  );

  return (
    <main className="max-w-[1100px] mx-auto space-y-4">
      <h1 className="text-xl font-bold">実績管理</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="font-semibold">追加</h2>
        <div className="grid gap-2 mt-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2"
            rows={3}
            placeholder="説明"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="URL（任意）"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={add}
            >
              追加
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5 overflow-x-auto">
        <h2 className="font-semibold mb-2">一覧</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="px-2 py-2 w-16">ID</th>
              <th className="px-2 py-2 w-64">タイトル</th>
              <th className="px-2 py-2">説明</th>
              <th className="px-2 py-2 w-64">URL</th>
              <th className="px-2 py-2 w-56">画像差し替え</th>
              <th className="px-2 py-2 w-40">操作</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      <pre className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
        {log}
      </pre>
    </main>
  );
}
