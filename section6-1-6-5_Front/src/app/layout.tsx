import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Portfolio",
  description: "ポートフォリオサイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="m-0 font-sans h-full bg-gray-50 text-gray-900">
        {/* キーボード用スキップリンク（Tabで最初にフォーカス） */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-white focus:text-blue-700 focus:px-3 focus:py-2 focus:rounded focus:shadow"
        >
          メインコンテンツへスキップ
        </a>

        {/* グローバルヘッダー */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                P
              </span>
              <span className="font-semibold text-lg tracking-tight">
                トップページ
              </span>
            </Link>

            {/* グローバルナビ */}
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/contact" className="navlink">
                コンタクト
              </Link>
              <Link href="/admin" className="navlink">
                管理画面（要ログイン）
              </Link>
              <Link href="/admin/contacts" className="navlink">
                お問い合わせ一覧
              </Link>
              <Link href="/login" className="navlink">
                ログイン
              </Link>
            </nav>
          </div>
        </header>

        {/* コンテンツ（メインにID付与） */}
        <main id="main" className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>

        {/* フッター（任意） */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500">
            © {new Date().getFullYear()} Portfolio
          </div>
        </footer>
      </body>
    </html>
  );
}
