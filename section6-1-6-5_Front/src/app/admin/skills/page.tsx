"use client";
import { useEffect, useMemo, useState } from "react";

type Skill = { id: number; name: string; level: number };

export default function SkillsPage() {
  const [items, setItems] = useState<Skill[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState(3);
  const [log, setLog] = useState("");

  function addLog(s: string) {
    setLog((p) => (p ? p + "\n" : "") + s);
  }

  async function load() {
    const r = await fetch("/api/admin/skills", { cache: "no-store" });
    if (r.ok) setItems(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    const res = await fetch("/api/admin/skills", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, level }),
    });
    if (!res.ok) addLog("❌ 追加失敗");
    setName("");
    setLevel(3);
    await load();
  }

  async function save(it: Skill) {
    const res = await fetch(`/api/admin/skills/${it.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: it.name, level: it.level }),
    });
    if (!res.ok) addLog("❌ 更新失敗");
    await load();
  }

  async function del(id: number) {
    if (!confirm("削除しますか？")) return;
    const res = await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    if (!res.ok) addLog("❌ 削除失敗");
    await load();
  }

  const rows = useMemo(
    () =>
      items.map((it) => (
        <tr key={it.id} className="border-t">
          <td className="px-2 py-2 text-gray-500">{it.id}</td>
          <td className="px-2 py-2">
            <input
              className="border rounded px-2 py-1 w-full"
              value={it.name}
              onChange={(e) =>
                setItems((arr) =>
                  arr.map((x) =>
                    x.id === it.id ? { ...x, name: e.target.value } : x
                  )
                )
              }
            />
          </td>
          <td className="px-2 py-2">
            <input
              type="number"
              min={1}
              max={5}
              className="border rounded px-2 py-1 w-24"
              value={it.level}
              onChange={(e) =>
                setItems((arr) =>
                  arr.map((x) =>
                    x.id === it.id
                      ? { ...x, level: Number(e.target.value) || 1 }
                      : x
                  )
                )
              }
            />
          </td>
          <td className="px-2 py-2 space-x-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => save(it)}
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
      )),
    [items]
  );

  return (
    <main className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">スキル管理</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="font-semibold">追加</h2>
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          <input
            className="border rounded px-3 py-2"
            placeholder="スキル名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            min={1}
            max={5}
            className="border rounded px-3 py-2 w-24"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={add}
          >
            追加
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="font-semibold mb-2">一覧</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="px-2 py-2 w-16">ID</th>
              <th className="px-2 py-2">名前</th>
              <th className="px-2 py-2 w-28">レベル</th>
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
