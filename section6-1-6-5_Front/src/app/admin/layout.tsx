// src/app/admin/layout.tsx
import { adminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = cookies().get("session")?.value;
  if (!cookie) return notFound();
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    const adminUid = process.env.ADMIN_UID!;
    if (decoded.uid !== adminUid) return notFound();
  } catch {
    return notFound();
  }

  return (
    <div className="space-y-4">
      {/* 管理用サブナビ */}
      <div className="card flex items-center justify-between">
        <div className="font-semibold">管理メニュー</div>
        <nav className="flex gap-2 text-sm">
          <Link href="/admin" className="navlink">
            ダッシュボード
          </Link>
          <Link href="/admin/contacts" className="navlink">
            お問い合わせ一覧
          </Link>
        </nav>
      </div>

      <div className="p-1">{children}</div>
    </div>
  );
}
