import { activateTenantAction, approveTenantAction, rejectTenantAction } from "@/app/actions/tenant";
import { db } from "@/lib/db";
import { subscriptions, tenants, user } from "@/lib/db/schema";
import { buildScanHostname, buildSiteHostname } from "@/lib/domains";
import { requireAdmin } from "@/lib/session";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const requests = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      status: tenants.status,
      requestNotes: tenants.requestNotes,
      ownerEmail: user.email,
      subscriptionStatus: subscriptions.status,
    })
    .from(tenants)
    .leftJoin(user, eq(user.id, tenants.ownerUserId))
    .leftJoin(subscriptions, eq(subscriptions.tenantId, tenants.id))
    .orderBy(desc(tenants.createdAt));

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">Admin</p>
          <h1 className="font-display text-5xl font-semibold tracking-[-0.05em]">Review tenant requests and promote them into billing.</h1>
        </div>

        <div className="grid gap-4">
          {requests.map((request) => (
            <article key={request.id} className="grid gap-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{request.name}</h2>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/55">
                    {request.status}
                  </span>
                </div>
                <p className="text-sm text-white/60">Owner: {request.ownerEmail}</p>
                <p className="text-sm text-white/60">Site: {buildSiteHostname(request.slug)}</p>
                <p className="text-sm text-white/60">Scanner: {buildScanHostname(request.slug)}:9100</p>
                <p className="text-sm leading-7 text-white/70">{request.requestNotes || "No notes provided."}</p>
              </div>

              <div className="grid gap-3">
                <p className="text-sm text-white/55">Subscription: {request.subscriptionStatus ?? "pending"}</p>

                {request.status === "pending_review" ? (
                  <>
                    <form action={approveTenantAction} className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                      <input type="hidden" name="tenantId" value={request.id} />
                      <textarea className="min-h-24 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm" name="reviewNotes" placeholder="Optional approval note" />
                      <button className="rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-slate-950">Approve tenant</button>
                    </form>

                    <form action={rejectTenantAction} className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                      <input type="hidden" name="tenantId" value={request.id} />
                      <textarea className="min-h-24 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm" name="reviewNotes" placeholder="Why this slug was rejected" />
                      <button className="rounded-full border border-rose-400/30 px-5 py-3 text-sm font-semibold text-rose-200">Reject request</button>
                    </form>
                  </>
                ) : request.status === "approved_pending_payment" && request.subscriptionStatus === "active" ? (
                  <div className="rounded-[1.25rem] border border-lime-200/20 bg-lime-200/10 p-4 text-sm text-lime-200">
                    Active - paid and ready
                  </div>
                ) : request.status === "approved_pending_payment" ? (
                  <div className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-sm text-white/60">
                      Waiting for payment. If payment was made but status is still pending, click activate to manually activate.
                    </p>
                    <form action={activateTenantAction}>
                      <input type="hidden" name="tenantId" value={request.id} />
                      <button type="submit" className="rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-slate-950">
                        Manually activate
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-white/60">
                    Status: {request.status}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}