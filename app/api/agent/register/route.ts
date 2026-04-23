import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { agentInstalls, tenants } from "@/lib/db/schema";
import { hashToken } from "@/lib/security";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = request.headers.get("X-Agent-Token") ?? body?.agentToken;

  if (!token) {
    return NextResponse.json({ error: "token_required" }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const agent = await db.query.agentInstalls.findFirst({
    where: eq(agentInstalls.tokenHash, tokenHash),
  });

  if (!agent) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, agent.tenantId),
  });

  await db
    .update(agentInstalls)
    .set({
      machineName: body?.machineName,
      version: body?.version,
      lastSeenAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(agentInstalls.id, agent.id));

  return NextResponse.json({
    success: true,
    tenantId: agent.tenantId,
    tenantSlug: tenant?.slug,
    tenantName: tenant?.name,
  });
}