"use client";

import { useEffect, useMemo, useState } from "react";

type Contact = {
  id: number;
  name: string;
  email: string;
  message: string;
  status: "NEW" | "DONE";
  createdAt: string;
};
type ListResp = { items: Contact[]; total: number; skip: number; take: number };

export default function AdminContacts() {
  const [items, setItems] = useState<Contact[]>([]);
  const [status, setStatus] = useState<"ALL" | "NEW" | "DONE">("ALL");
  const [skip, setSkip] = useState(0);
  const [take] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / take)),
    [total, take]
  );
  const page = useMemo(() => Math.floor(skip / take) + 1, [skip, take]);

  async function load() {
    setLoading(true);
    try {
      const url = `/api/admin/contacts?skip=${skip}&take=${take}&status=${status}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as ListResp;
      setItems(json.items);
      setTotal(json.total);
    } catch (e: any) {
      setToast(`読み込み失敗: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [skip, take, status]);

  async function changeStatus(id: number, next: "NEW" | "DONE") {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) return setToast(`更新失敗: ${await res.text()}`);
    setToast("更新しました");
    load();
  }

  async function remove(id: number) {
    if (!confirm("このお問い合わせを削除します。よろしいですか？")) return;
    const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    if (!res.ok) return setToast(`削除失敗: ${await res.text()}`);
    setToast("削除しました");
    if (items.length === 1 && skip >= take) setSkip(skip - take);
    else load();
  }

  return (
    <main className="space-y-4">
      <div className="card flex items-center justify-between">
        <h1 className="text-lg font-bold">お問い合わせ一覧</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600" htmlFor="status-filter">
            表示:
          </label>
          <select
            id="status-filter"
            className="input max-w-[160px]"
            value={status}
            onChange={(e) => {
              setSkip(0);
              setStatus(e.target.value as any);
            }}
          >
            <option value="ALL">すべて</option>
            <option value="NEW">未対応</option>
            <option value="DONE">対応済み</option>
          </select>

          <button
            className="btn btn-secondary"
            onClick={() => load()}
            disabled={loading}
          >
            再読み込み
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <caption className="sr-only">お問い合わせ一覧テーブル</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">日時</th>
              <th scope="col">氏名</th>
              <th scope="col">メール</th>
              <th scope="col">メッセージ</th>
              <th scope="col">状態</th>
              <th scope="col">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-4">
                  <div className="animate-pulse h-6 bg-gray-100 rounded" />
                </td>
              </tr>
            ) : items.length ? (
              items.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td className="whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td>{c.name}</td>
                  <td>
                    <a
                      className="text-blue-600 hover:underline"
                      href={`mailto:${c.email}`}
                    >
                      {c.email}
                    </a>
                  </td>
                  <td className="whitespace-pre-wrap">{c.message}</td>
                  <td>
                    <span
                      className={`badge ${
                        c.status === "NEW" ? "bg-yellow-100" : "bg-green-100"
                      }`}
                    >
                      {c.status === "NEW" ? "未対応" : "対応済み"}
                    </span>
                  </td>
                  <td className="space-x-2">
                    {c.status === "NEW" ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => changeStatus(c.id, "DONE")}
                      >
                        対応済みにする
                      </button>
                    ) : (
                      <button
                        className="btn"
                        onClick={() => changeStatus(c.id, "NEW")}
                      >
                        未対応に戻す
                      </button>
                    )}
                    <button
                      className="btn btn-secondary"
                      onClick={() => remove(c.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-8">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ページネーション */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-secondary"
          disabled={skip === 0}
          onClick={() => setSkip(Math.max(0, skip - take))}
        >
          前へ
        </button>
        <span className="text-sm">
          {page} / {pages}
        </span>
        <button
          className="btn btn-secondary"
          disabled={skip + take >= total}
          onClick={() => setSkip(skip + take)}
        >
          次へ
        </button>
        <span className="text-sm text-gray-600 ml-2">全 {total} 件</span>
      </div>

      {/* トースト（読み上げ対応） */}
      {!!toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 bg-black text-white rounded px-4 py-2 shadow"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
