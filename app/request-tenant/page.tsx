import { createTenantRequestAction } from "@/app/actions/tenant";
import { getOwnedTenant, isAdminEmail, requireSession } from "@/lib/session";
import { redirect } from "next/navigation";

type RequestTenantPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RequestTenantPage({ searchParams }: RequestTenantPageProps) {
  const session = await requireSession();

  if (isAdminEmail(session.user.email)) {
    redirect("/admin");
  }

  const tenant = await getOwnedTenant(session.user.id);

  if (tenant) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-lime-200/70">Tenant request</p>
          <h1 className="font-display text-5xl font-semibold tracking-[-0.05em]">Claim the hostname you want us to review.</h1>
          <p className="text-lg leading-8 text-white/62">
            Once approved, the platform creates the website hostname and scanner hostname pair for your tenant.
          </p>
        </div>

        <form action={createTenantRequestAction} className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <label className="grid gap-2 text-sm text-white/80">
            Company name
            <input className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3" name="name" placeholder="Atlas Wholesale" />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            Requested subdomain slug
            <input className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3" name="slug" placeholder="atlas" />
          </label>

          <label className="grid gap-2 text-sm text-white/80">
            Notes for admin review
            <textarea className="min-h-32 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3" name="notes" placeholder="Mention deployment region, ERP setup details, or naming context." />
          </label>

          {params.error === "slug_taken" ? (
            <p className="text-sm text-rose-300">That subdomain is already taken.</p>
          ) : null}

          <button className="rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950">Submit for approval</button>
        </form>
      </div>
    </main>
  );
}
