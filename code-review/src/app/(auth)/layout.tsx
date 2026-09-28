import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-1 text-center text-2xl font-bold text-indigo-700">PeerReview</h1>
      <p className="mb-6 text-center text-sm text-slate-500">Peer code review for students</p>
      <div className="card">{children}</div>
    </main>
  );
}
