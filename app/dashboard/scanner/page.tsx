import { eq } from "drizzle-orm";

import { updateScannerEndpointAction } from "@/app/actions/tenant";
import { db } from "@/lib/db";
import { scannerEndpoints } from "@/lib/db/schema";
import { buildScanHostname } from "@/lib/domains";
import { requireOwnedTenant } from "@/lib/session";

type ScannerPageProps = {
  searchParams: Promise<{ warning?: string; success?: string }>;
};

export const dynamic = "force-dynamic";

export default async function ScannerPage({ searchParams }: ScannerPageProps) {
  const { tenant } = await requireOwnedTenant();
  const scanner = await db.query.scannerEndpoints.findFirst({
    where: eq(scannerEndpoints.tenantId, tenant.id),
  });
  const params = await searchParams;

  return (
    <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">Scanner endpoint</p>
        <h2 className="text-3xl font-semibold">Configure your scanner endpoint.</h2>
        <p className="text-white/60">
          Enter your public IP address to keep your scanner endpoint pointing to the right location.
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5 text-sm text-white/70">
        Configure the scanner with host <span className="text-white">{buildScanHostname(tenant.slug)}</span> and port <span className="text-white">{scanner?.port ?? 9100}</span>.
      </div>

      <form action={updateScannerEndpointAction} className="grid gap-5 md:max-w-2xl">
        <label className="grid gap-2 text-sm text-white/80">
          Public IP address
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3"
            defaultValue={scanner?.publicIp ?? ""}
            name="publicIp"
            placeholder="Enter your public IP address"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/80">
          Scan port
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3"
            defaultValue={scanner?.port ?? 9100}
            name="port"
            type="number"
          />
        </label>

        {params.warning === "ip_mismatch" || scanner?.mismatchWarning ? (
<p className="text-sm text-amber-300">
            The IP you entered is different from your detected public IP. Please verify you are entering your external IP address, not a local network address.
          </p>
        ) : null}

        {params.success === "saved" ? <p className="text-sm text-lime-200">Scanner DNS update queued successfully.</p> : null}

        <button className="rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950">
          Save scanner settings
        </button>
      </form>
    </section>
  );
}
