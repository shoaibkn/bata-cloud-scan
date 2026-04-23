import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { TenantShowcase } from "@/components/site/tenant-showcase";
import { db } from "@/lib/db";
import { buildScanHostname, buildSiteHostname } from "@/lib/domains";
import { siteContent, tenants } from "@/lib/db/schema";

type TenantSitePageProps = {
  params: Promise<{ slug: string }>;
};

async function getTenantSite(slug: string) {
  return db
    .select({
      tenantName: tenants.name,
      tenantSlug: tenants.slug,
      tenantStatus: tenants.status,
      eyebrow: siteContent.eyebrow,
      headline: siteContent.headline,
      subheadline: siteContent.subheadline,
      body: siteContent.body,
      ctaLabel: siteContent.ctaLabel,
      ctaHref: siteContent.ctaHref,
      accentColor: siteContent.accentColor,
      panelColor: siteContent.panelColor,
      contactEmail: siteContent.contactEmail,
      supportPhone: siteContent.supportPhone,
      features: siteContent.features,
    })
    .from(tenants)
    .innerJoin(siteContent, eq(siteContent.tenantId, tenants.id))
    .where(and(eq(tenants.slug, slug), eq(tenants.status, "active")));
}

export async function generateMetadata({ params }: TenantSitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const [site] = await getTenantSite(slug);

  if (!site) {
    return {
      title: "Portal not found | Lumin8 SVS",
    };
  }

  return {
    title: `${site.tenantName} | Lumin8 SVS`,
    description: site.subheadline,
  };
}

export default async function TenantSitePage({ params }: TenantSitePageProps) {
  const { slug } = await params;
  const [site] = await getTenantSite(slug);

  if (!site) {
    notFound();
  }

  return (
    <TenantShowcase
      eyebrow={site.eyebrow}
      headline={site.headline}
      subheadline={site.subheadline}
      body={site.body}
      ctaLabel={site.ctaLabel}
      ctaHref={site.ctaHref}
      accentColor={site.accentColor}
      panelColor={site.panelColor}
      contactEmail={site.contactEmail}
      supportPhone={site.supportPhone}
      features={site.features}
      hostname={buildSiteHostname(site.tenantSlug)}
      scanHostname={buildScanHostname(site.tenantSlug)}
    />
  );
}
