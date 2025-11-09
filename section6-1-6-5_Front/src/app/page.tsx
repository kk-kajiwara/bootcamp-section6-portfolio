import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type HomeData = {
  profile: { name: string; bio: string; avatarUrl: string | null } | null;
  skills: { id: number; name: string; level: number }[];
  projects: {
    id: number;
    title: string;
    description: string;
    url: string | null;
    imageUrl: string | null;
  }[];
};

export default async function Home() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) throw new Error("host header missing");
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/public/home`, { cache: "no-store" });
  if (!res.ok) throw new Error(`failed to load home: ${res.status}`);

  const data: HomeData = await res.json();

  return (
    // 余白は各セクションで個別に付ける（space-y-* は使わない）
    <main id="main" className="max-w-4xl mx-auto p-6 ani-enter">
      {/* ロゴ（直下にプロフィールが来る） */}
      <div className="site-logo">
        <img
          src="/assets/logo-portfolio-transparent.png"
          alt="PORTFOLIO ロゴ"
          width={560}
          height={180}
          loading="eager"
        />
      </div>

      {/* プロフィール（ロゴのすぐ下） */}
      {data.profile ? (
        <section className="card mt-2">
          <h2 className="text-xl font-semibold border-l-4 border-blue-500 pl-3 mb-4">
            プロフィール
          </h2>

          <div className="flex items-start gap-5">
            {data.profile.avatarUrl ? (
              <img
                src={data.profile.avatarUrl}
                alt={`${data.profile.name}のアバター画像`}
                width={96}
                height={96}
                className="rounded-full border object-cover ring-2 ring-blue-200"
              />
            ) : null}

            <div>
              <h3 className="text-2xl font-bold">{data.profile.name}</h3>
              <p className="text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                {data.profile.bio}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* スキル */}
      <section className="card mt-6">
        <h2 className="text-xl font-semibold border-l-4 border-blue-500 pl-3 mb-4">
          スキル
        </h2>

        <ul className="space-y-3">
          {data.skills.map((s) => {
            const maxLevel = 5;
            const pct = Math.min(100, Math.round((s.level / maxLevel) * 100));

            let color = "bg-gray-300";
            if (s.level >= 5) color = "bg-blue-600";
            else if (s.level >= 4) color = "bg-blue-400";
            else if (s.level >= 3) color = "bg-green-400";
            else if (s.level >= 2) color = "bg-yellow-400";
            else if (s.level > 0) color = "bg-orange-400";

            return (
              <li key={s.id} className="grid gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-gray-500">Lv{s.level}</span>
                </div>

                <div
                  className="h-2 rounded-full bg-gray-100 overflow-hidden"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={maxLevel}
                  aria-valuenow={Math.min(s.level, maxLevel)}
                  aria-label={`${s.name} レベル`}
                >
                  <div
                    className={`h-full ${color} transition-[width] duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 実績 */}
      <section className="card mt-6">
        <h2 className="text-xl font-semibold border-l-4 border-blue-500 pl-3 mb-4">
          実績
        </h2>

        <ul className="grid gap-6 sm:grid-cols-2">
          {data.projects.map((p) => (
            <li
              key={p.id}
              className="list-none bg-gray-50 rounded-xl border p-4 transition hover:shadow-md hover:bg-white"
            >
              <div className="flex items-start gap-3">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={`${p.title}のサムネイル`}
                    width={96}
                    height={96}
                    className="rounded border object-cover"
                  />
                ) : null}
                <div>
                  <strong className="block text-base">{p.title}</strong>
                  <p className="text-gray-700 my-1 leading-relaxed">
                    {p.description}
                  </p>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline navlink px-0 py-0"
                    >
                      リンクを開く
                    </a>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
