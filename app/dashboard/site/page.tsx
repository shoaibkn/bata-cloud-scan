import { eq } from "drizzle-orm";

import { updateSiteContentAction } from "@/app/actions/tenant";
import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { buildSiteHostname } from "@/lib/domains";
import { requireOwnedTenant } from "@/lib/session";

type SitePageProps = {
  searchParams: Promise<{ success?: string }>;
};

export const dynamic = "force-dynamic";

export default async function SitePage({ searchParams }: SitePageProps) {
  const { tenant } = await requireOwnedTenant();
  const content = await db.query.siteContent.findFirst({
    where: eq(siteContent.tenantId, tenant.id),
  });
  const params = await searchParams;

  if (!content) {
    return null;
  }

  return (
    <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">Editable minisite</p>
        <h2 className="text-3xl font-semibold">Tune the public landing page that lives on {buildSiteHostname(tenant.slug)}.</h2>
      </div>

      <form action={updateSiteContentAction} className="grid gap-4 xl:grid-cols-2">
        {[
          ["eyebrow", "Eyebrow", content.eyebrow],
          ["headline", "Headline", content.headline],
          ["subheadline", "Subheadline", content.subheadline],
          ["ctaLabel", "CTA label", content.ctaLabel],
          ["ctaHref", "CTA href", content.ctaHref],
          ["accentColor", "Accent color", content.accentColor],
          ["panelColor", "Panel color", content.panelColor],
          ["contactEmail", "Contact email", content.contactEmail ?? ""],
          ["supportPhone", "Support phone", content.supportPhone ?? ""],
        ].map(([name, label, value]) => (
          <label key={String(name)} className="grid gap-2 text-sm text-white/80">
            {label}
            <input className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3" name={String(name)} defaultValue={String(value)} />
          </label>
        ))}

        <label className="grid gap-2 text-sm text-white/80 xl:col-span-2">
          Body copy
          <textarea className="min-h-28 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3" name="body" defaultValue={content.body} />
        </label>

        <label className="grid gap-2 text-sm text-white/80 xl:col-span-2">
          Features, one per line
          <textarea className="min-h-28 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3" name="features" defaultValue={content.features.join("\n")} />
        </label>

        {params.success === "saved" ? <p className="text-sm text-lime-200 xl:col-span-2">Minisite updated.</p> : null}

        <button className="rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950 xl:col-span-2 xl:w-fit">
          Save minisite
        </button>
      </form>
    </section>
  );
}
