import { Webhooks } from "@dodopayments/nextjs";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { agentInstalls, auditLogs, domains, siteContent, subscriptions, tenants, user } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { buildOnboardingHtml, buildOnboardingText, sendOnboardingEmail } from "@/lib/email";
import { buildScanHostname, buildSiteHostname } from "@/lib/domains";
import { makeId } from "@/lib/security";

async function activateTenantBySubscriptionId(subscriptionId: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.providerSubscriptionId, subscriptionId),
  });

  if (!subscription) {
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: "active",
      activatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

  await db
    .update(tenants)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, subscription.tenantId));

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId: subscription.tenantId,
    action: "subscription_activated",
    metadata: {
      subscriptionId,
    },
  });

  await sendOnboardingEmailForTenant(subscription.tenantId);
}

async function activateTenantByMetadata(tenantId: string, subscriptionId: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, tenantId),
  });

  if (!subscription) {
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: "active",
      providerSubscriptionId: subscriptionId,
      activatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

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
    action: "subscription_activated",
    metadata: {
      subscriptionId,
    },
  });

  await sendOnboardingEmailForTenant(tenantId);
}

async function sendOnboardingEmailForTenant(tenantId: string) {
  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) {
    return;
  }

  const userRecord = await db.query.user.findFirst({
    where: eq(user.id, tenant.ownerUserId),
  });

  if (!userRecord) {
    return;
  }

  const agent = await db.query.agentInstalls.findFirst({
    where: eq(agentInstalls.tenantId, tenantId),
  });

  if (!agent) {
    return;
  }

  const siteHostname = buildSiteHostname(tenant.slug);
  const scanHostname = buildScanHostname(tenant.slug);
  const agentDownloadUrl = `${env.appUrl}/download/agent`;

  await sendOnboardingEmail({
    email: userRecord.email,
    subject: `Welcome to Lumin8 SVS - ${tenant.name}`,
    html: buildOnboardingHtml({
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      siteHostname,
      scanHostname,
      agentToken: agent.plainToken,
      agentDownloadUrl,
    }),
    text: buildOnboardingText({
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      siteHostname,
      scanHostname,
      agentToken: agent.plainToken,
      agentDownloadUrl,
    }),
  });
}

async function setSubscriptionState(
  subscriptionId: string,
  status: "past_due" | "cancelled" | "expired",
  tenantStatus: "payment_past_due" | "cancelled" | "suspended",
) {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.providerSubscriptionId, subscriptionId),
  });

  if (!subscription) {
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

  await db
    .update(tenants)
    .set({
      status: tenantStatus,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, subscription.tenantId));

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId: subscription.tenantId,
    action: `subscription_${status}`,
    metadata: {
      subscriptionId,
    },
  });
}

export async function POST(request: Request) {
  if (!env.dodoWebhookSecret) {
    return NextResponse.json(
      { error: "dodo_webhook_not_configured" },
      { status: 503 },
    );
  }

  return Webhooks({
    webhookKey: env.dodoWebhookSecret,
    onSubscriptionActive: async (payload) => {
      const data = payload.data;
      const subscriptionId = data.subscription_id;
      const tenantId = data.metadata?.tenantId;

      if (subscriptionId) {
        await activateTenantBySubscriptionId(subscriptionId);
      } else if (tenantId) {
        await activateTenantByMetadata(tenantId, subscriptionId);
      }
    },
    onSubscriptionRenewed: async (payload) => {
      const data = payload.data;
      const subscriptionId = data.subscription_id;
      const tenantId = data.metadata?.tenantId;

      if (subscriptionId) {
        await activateTenantBySubscriptionId(subscriptionId);
      } else if (tenantId) {
        await activateTenantByMetadata(tenantId, subscriptionId);
      }
    },
    onSubscriptionFailed: async (payload) => {
      const subscriptionId = payload.data.subscription_id;
      if (subscriptionId) {
        await setSubscriptionState(
          subscriptionId,
          "past_due",
          "payment_past_due",
        );
      }
    },
    onSubscriptionCancelled: async (payload) => {
      const subscriptionId = payload.data.subscription_id;
      if (subscriptionId) {
        await setSubscriptionState(
          subscriptionId,
          "cancelled",
          "cancelled",
        );
      }
    },
    onSubscriptionExpired: async (payload) => {
      const subscriptionId = payload.data.subscription_id;
      if (subscriptionId) {
        await setSubscriptionState(
          subscriptionId,
          "expired",
          "suspended",
        );
      }
    },
  })(request as never);
}