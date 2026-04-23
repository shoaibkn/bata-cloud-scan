"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { upsertScanDnsRecord } from "@/lib/cloudflare";
import { db } from "@/lib/db";
import {
  agentInstalls,
  auditLogs,
  domains,
  scannerEndpoints,
  siteContent,
  subscriptions,
  tenants,
} from "@/lib/db/schema";
import { buildScanHostname, buildSiteHostname } from "@/lib/domains";
import { env } from "@/lib/env";
import { requireAdmin, requireOwnedTenant, requireSession } from "@/lib/session";
import { getFirstIp, titleCase } from "@/lib/utils";
import { hashToken, makeId, makeToken, slugify } from "@/lib/security";
import {
  scannerEndpointSchema,
  siteContentSchema,
  tenantRequestSchema,
} from "@/lib/validators";

export async function createTenantRequestAction(formData: FormData) {
  const session = await requireSession();
  const existingTenant = await db.query.tenants.findFirst({
    where: eq(tenants.ownerUserId, session.user.id),
  });

  if (existingTenant) {
    redirect("/dashboard");
  }

  const parsed = tenantRequestSchema.parse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") ?? "")),
    notes: formData.get("notes"),
  });

  const slugInUse = await db.query.tenants.findFirst({
    where: eq(tenants.slug, parsed.slug),
  });

  if (slugInUse) {
    redirect("/request-tenant?error=slug_taken");
  }

  const tenantId = makeId();
  const agentToken = makeToken();

  await db.insert(tenants).values({
    id: tenantId,
    name: parsed.name,
    slug: parsed.slug,
    ownerUserId: session.user.id,
    requestNotes: parsed.notes,
    status: "pending_review",
  });

  await db.insert(agentInstalls).values({
    id: makeId(),
    tenantId,
    tokenHash: hashToken(agentToken),
    plainToken: agentToken,
  });

  await db.insert(siteContent).values({
    id: makeId(),
    tenantId,
    eyebrow: "Scan-ready ERP routing",
    headline: `${titleCase(parsed.name)} keeps every scan on track.`,
    subheadline:
      "A branded endpoint, a managed setup flow, and a storefront that turns operational trust into a sales asset.",
    body: "Keep scanner traffic pointed at your reader server while giving your team a tenant-branded web presence and centralized billing.",
    ctaLabel: "Start a rollout",
    ctaHref: env.appUrl,
    accentColor: "#d2ff72",
    panelColor: "#091222",
    contactEmail: session.user.email,
    supportPhone: "",
    features: [
      "Port 9100 endpoint management",
      "Manual or agent-based IP sync",
      "Admin-approved branded tenant domain",
    ],
  });

  await db.insert(scannerEndpoints).values({
    id: makeId(),
    tenantId,
    port: 9100,
    ipSource: "manual",
  });

  await db.insert(subscriptions).values({
    id: makeId(),
    tenantId,
    status: "pending",
    productId: env.dodoPlanProductId,
  });

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId,
    actorUserId: session.user.id,
    action: "tenant_requested",
    metadata: {
      slug: parsed.slug,
    },
  });

  redirect("/pending-approval");
}

export async function approveTenantAction(formData: FormData) {
  const session = await requireAdmin();
  const tenantId = String(formData.get("tenantId") ?? "");

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) {
    redirect("/admin?error=tenant_missing");
  }

  await db
    .update(tenants)
    .set({
      status: "approved_pending_payment",
      approvedAt: new Date(),
      reviewNotes: String(formData.get("reviewNotes") ?? ""),
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenant.id));

  await db
    .insert(domains)
    .values([
      {
        id: makeId(),
        tenantId: tenant.id,
        hostname: buildSiteHostname(tenant.slug),
        type: "site",
        proxied: true,
      },
      {
        id: makeId(),
        tenantId: tenant.id,
        hostname: buildScanHostname(tenant.slug),
        type: "scan",
        proxied: false,
      },
    ])
    .onConflictDoNothing();

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId: tenant.id,
    actorUserId: session.user.id,
    action: "tenant_approved",
    metadata: {
      slug: tenant.slug,
    },
  });

  revalidatePath("/admin");
  redirect("/admin?success=approved");
}

export async function rejectTenantAction(formData: FormData) {
  const session = await requireAdmin();
  const tenantId = String(formData.get("tenantId") ?? "");

  await db
    .update(tenants)
    .set({
      status: "rejected",
      rejectedAt: new Date(),
      reviewNotes: String(formData.get("reviewNotes") ?? ""),
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId,
    actorUserId: session.user.id,
    action: "tenant_rejected",
    metadata: {},
  });

  revalidatePath("/admin");
  redirect("/admin?success=rejected");
}

export async function updateScannerEndpointAction(formData: FormData) {
  const { session, tenant } = await requireOwnedTenant();
  const parsed = scannerEndpointSchema.parse({
    publicIp: formData.get("publicIp"),
    port: formData.get("port"),
  });

  const requestHeaders = await headers();
  const observedIp = getFirstIp(requestHeaders.get("x-forwarded-for"));
  const mismatchWarning = Boolean(observedIp && observedIp !== parsed.publicIp);

  const dnsResult = await upsertScanDnsRecord({
    hostname: buildScanHostname(tenant.slug),
    ipAddress: parsed.publicIp,
  });

  await db
    .update(scannerEndpoints)
    .set({
      publicIp: parsed.publicIp,
      port: parsed.port,
      ipSource: "manual",
      lastObservedPublicIp: observedIp,
      mismatchWarning,
      lastVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scannerEndpoints.tenantId, tenant.id));

  if (dnsResult.recordId) {
    await db
      .update(domains)
      .set({
        cloudflareRecordId: dnsResult.recordId,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(domains.tenantId, tenant.id), eq(domains.type, "scan")));
  }

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId: tenant.id,
    actorUserId: session.user.id,
    action: "scanner_endpoint_updated",
    metadata: {
      publicIp: parsed.publicIp,
      observedIp,
      mismatchWarning,
    },
  });

  revalidatePath("/dashboard/scanner");
  redirect(
    `/dashboard/scanner?${mismatchWarning ? "warning=ip_mismatch" : "success=saved"}`,
  );
}

export async function updateSiteContentAction(formData: FormData) {
  const { session, tenant } = await requireOwnedTenant();
  const parsed = siteContentSchema.parse({
    eyebrow: formData.get("eyebrow"),
    headline: formData.get("headline"),
    subheadline: formData.get("subheadline"),
    body: formData.get("body"),
    ctaLabel: formData.get("ctaLabel"),
    ctaHref: formData.get("ctaHref"),
    accentColor: formData.get("accentColor"),
    panelColor: formData.get("panelColor"),
    contactEmail: formData.get("contactEmail"),
    supportPhone: formData.get("supportPhone"),
    features: formData.get("features"),
  });

  await db
    .update(siteContent)
    .set({
      eyebrow: parsed.eyebrow,
      headline: parsed.headline,
      subheadline: parsed.subheadline,
      body: parsed.body,
      ctaLabel: parsed.ctaLabel,
      ctaHref: parsed.ctaHref,
      accentColor: parsed.accentColor,
      panelColor: parsed.panelColor,
      contactEmail: parsed.contactEmail,
      supportPhone: parsed.supportPhone,
      features: parsed.features.split("\n").map((feature) => feature.trim()).filter(Boolean),
      updatedAt: new Date(),
    })
    .where(eq(siteContent.tenantId, tenant.id));

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId: tenant.id,
    actorUserId: session.user.id,
    action: "site_content_updated",
    metadata: {},
  });

  revalidatePath("/dashboard/site");
  revalidatePath(`/_sites/${tenant.slug}`);
  redirect("/dashboard/site?success=saved");
}

export async function rotateAgentTokenAction() {
  const { session, tenant } = await requireOwnedTenant();
  const token = makeToken();

  await db
    .insert(agentInstalls)
    .values({
      id: makeId(),
      tenantId: tenant.id,
      tokenHash: hashToken(token),
      plainToken: token,
    })
    .onConflictDoUpdate({
      target: agentInstalls.tenantId,
      set: {
        tokenHash: hashToken(token),
        plainToken: token,
        updatedAt: new Date(),
      },
    });

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId: tenant.id,
    actorUserId: session.user.id,
    action: "agent_token_rotated",
    metadata: {},
  });

  redirect(`/dashboard/agent?token=${token}`);
}

export async function activateTenantAction(formData: FormData) {
  const session = await requireAdmin();
  const tenantId = String(formData.get("tenantId") ?? "");

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) {
    redirect("/admin?error=tenant_missing");
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, tenantId),
  });

  const subscriptionId = `manual_${makeId()}`;

  if (subscription) {
    await db
      .update(subscriptions)
      .set({
        status: "active",
        providerSubscriptionId: subscriptionId,
        activatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));
  }

  await db
    .update(tenants)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId,
    actorUserId: session.user.id,
    action: "subscription_activated_manually",
    metadata: {
      subscriptionId,
    },
  });

  revalidatePath("/admin");
  redirect("/admin?success=activated");
}
