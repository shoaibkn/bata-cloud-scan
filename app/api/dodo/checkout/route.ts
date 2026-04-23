import { NextResponse } from "next/server";
import { Checkout } from "@dodopayments/nextjs";

import { env } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  const tenantId = url.searchParams.get("metadata_tenantId");

  if (!env.dodoApiKey || !env.dodoReturnUrl) {
    return NextResponse.json(
      { error: "dodo_not_configured" },
      { status: 503 },
    );
  }

  if (!productId) {
    return NextResponse.json(
      { error: "productId_required" },
      { status: 400 },
    );
  }

  if (!tenantId) {
    return NextResponse.json(
      { error: "tenantId_required" },
      { status: 400 },
    );
  }

  const returnUrl = `${env.dodoReturnUrl}?tenantId=${tenantId}`;

  return Checkout({
    bearerToken: env.dodoApiKey,
    returnUrl,
    environment: env.dodoEnvironment,
    type: "static",
  })(request as never);
}