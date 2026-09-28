import Link from "next/link";
import { requireUser } from "@/server/auth";
import { logoutAction } from "../(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/submissions/new", label: "New submission" },
  { href: "/history", label: "History" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/dashboard" className="text-lg font-bold text-indigo-700">PeerReview</Link>
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-indigo-700">{n.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}
