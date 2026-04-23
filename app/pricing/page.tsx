import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-lime-200/70">Pricing</p>
          <h1 className="font-display text-5xl font-semibold tracking-[-0.05em]">Simple pricing for Bata SVS ERP users.</h1>
          <p className="max-w-2xl text-lg leading-8 text-white/62">
            One plan gives you everything you need to scan products remotely for Bata SVS ERP. Get your scanner endpoint and manage everything from your dashboard.
          </p>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Service plan</p>
              <h2 className="text-4xl font-semibold">Lumin8 SVS</h2>
              <p className="max-w-xl text-white/62">
                Remote barcode scanning for Bata SVS ERP. Includes your scanner endpoint, remote access for your team, and dashboard management.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950"
            >
              Get started
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-amber-200/20 bg-amber-200/10 p-6">
          <h2 className="font-display text-lg font-semibold text-amber-200">Independent service notice</h2>
          <p className="mt-2 text-white/60">
            Lumin8 SVS is an independent scanner routing service for Bata SVS ERP users. We are not affiliated with, endorsed by, or connected to Barcode India Private Limited in any way.
          </p>
        </section>
      </div>
    </main>
  );
}