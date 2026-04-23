import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { auditLogs, subscriptions, tenants } from "@/lib/db/schema";
import { makeId } from "@/lib/security";
import { requireAdmin } from "@/lib/session";

export async function POST(request: Request) {
  const session = await requireAdmin();

  const body = (await request.json()) as {
    tenantId?: string;
  };

  if (!body.tenantId) {
    return NextResponse.json(
      { error: "tenantId_required" },
      { status: 400 },
    );
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, body.tenantId),
  });

  if (!tenant) {
    return NextResponse.json(
      { error: "tenant_not_found" },
      { status: 404 },
    );
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, body.tenantId),
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
    .where(eq(tenants.id, body.tenantId));

  await db.insert(auditLogs).values({
    id: makeId(),
    tenantId: body.tenantId,
    actorUserId: session.user.id,
    action: "subscription_activated_manually",
    metadata: {
      subscriptionId,
      activatedBy: session.user.email,
    },
  });

  return NextResponse.json({
    success: true,
    tenantId: body.tenantId,
    tenantStatus: "active",
    subscriptionStatus: "active",
  });
}