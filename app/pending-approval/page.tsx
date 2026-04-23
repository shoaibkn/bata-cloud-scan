import Link from "next/link";

import { requireOwnedTenant } from "@/lib/session";

export default async function PendingApprovalPage() {
  const { tenant } = await requireOwnedTenant();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">Approval pending</p>
        <h1 className="font-display mt-5 text-5xl font-semibold tracking-[-0.05em]">
          `{tenant.slug}` is waiting for admin review.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/62">
          After approval you will be sent to billing and can activate the tenant, then configure the scanner endpoint and minisite.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/dashboard" className="rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950">
            Open dashboard
          </Link>
          <Link href="/" className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/75">
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
