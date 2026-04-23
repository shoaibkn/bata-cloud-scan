import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { upsertScanDnsRecord } from "@/lib/cloudflare";
import { db } from "@/lib/db";
import { agentInstalls, domains, scannerEndpoints, tenants } from "@/lib/db/schema";
import { buildScanHostname } from "@/lib/domains";
import { hashToken } from "@/lib/security";

export async function POST(request: Request) {
  const token = request.headers.get("X-Agent-Token");
  const body = await request.json().catch(() => ({}));

  const agentToken = token ?? body?.agentToken;
  const publicIp = body?.publicIp ?? body?.PublicIp;
  const port = body?.port ?? body?.Port ?? 9100;
  const isReachable = body?.isReachable ?? body?.isReachable ?? false;

  if (!agentToken || !publicIp) {
    return NextResponse.json(
      { success: false, message: "token_and_public_ip_required" },
      { status: 400 }
    );
  }

  const tokenHash = hashToken(agentToken);
  const agent = await db.query.agentInstalls.findFirst({
    where: eq(agentInstalls.tokenHash, tokenHash),
  });

  if (!agent) {
    return NextResponse.json(
      { success: false, message: "invalid_token" },
      { status: 401 }
    );
  }

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, agent.tenantId),
  });

  if (!tenant) {
    return NextResponse.json(
      { success: false, message: "tenant_missing" },
      { status: 404 }
    );
  }

  const dnsResult = await upsertScanDnsRecord({
    hostname: buildScanHostname(tenant.slug),
    ipAddress: publicIp,
  });

  await db
    .update(agentInstalls)
    .set({
      lastSeenAt: new Date(),
      lastPublicIp: publicIp,
      localReaderReachable: isReachable,
      updatedAt: new Date(),
    })
    .where(eq(agentInstalls.id, agent.id));

  await db
    .update(scannerEndpoints)
    .set({
      publicIp: publicIp,
      lastObservedPublicIp: publicIp,
      mismatchWarning: false,
      ipSource: "agent",
      lastVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scannerEndpoints.tenantId, agent.tenantId));

  if (dnsResult.recordId) {
    await db
      .update(domains)
      .set({
        cloudflareRecordId: dnsResult.recordId,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(domains.tenantId, agent.tenantId), eq(domains.type, "scan")));
  }

  return NextResponse.json({
    success: true,
    message: "heartbeat_received",
    currentIp: publicIp,
  });
}