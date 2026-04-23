import Link from "next/link";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { buildScanHostname, buildSiteHostname } from "@/lib/domains";
import { scannerEndpoints, subscriptions } from "@/lib/db/schema";
import { formatDate } from "@/lib/utils";
import { requireOwnedTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { tenant } = await requireOwnedTenant();
  const scanner = await db.query.scannerEndpoints.findFirst({
    where: eq(scannerEndpoints.tenantId, tenant.id),
  });
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, tenant.id),
  });

  const cards = [
    {
      label: "Tenant status",
      value: tenant.status,
      helper: `Approved at ${formatDate(tenant.approvedAt)}`,
    },
    {
      label: "Website hostname",
      value: buildSiteHostname(tenant.slug),
      helper: "Vercel-hosted minisite",
    },
    {
      label: "Scanner hostname",
      value: `${buildScanHostname(tenant.slug)}:${scanner?.port ?? 9100}`,
      helper: scanner?.publicIp ? `Mapped to ${scanner.publicIp}` : "Public IP not configured yet",
    },
    {
      label: "Subscription",
      value: subscription?.status ?? "pending",
      helper: subscription?.activatedAt ? `Activated ${formatDate(subscription.activatedAt)}` : "Waiting on payment",
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-white/45">{card.label}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-sm text-white/55">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">What to do next</p>
          <h2 className="text-2xl font-semibold">Finish the tenant activation path.</h2>
          <p className="text-white/60">
            Payment activates the tenant, scanner DNS maps traffic, and the minisite becomes your public-facing landing page.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-white/70">
          <Link href="/dashboard/billing" className="rounded-2xl border border-white/10 px-4 py-4 transition hover:bg-white/8">
            1. Complete Dodo billing setup
          </Link>
          <Link href="/dashboard/scanner" className="rounded-2xl border border-white/10 px-4 py-4 transition hover:bg-white/8">
            2. Add public IP and validate scan hostname
          </Link>
          <Link href="/dashboard/site" className="rounded-2xl border border-white/10 px-4 py-4 transition hover:bg-white/8">
            3. Edit the branded minisite
          </Link>
        </div>
      </section>
    </div>
  );
}
