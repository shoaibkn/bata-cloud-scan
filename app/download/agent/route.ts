import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const agentUrl = env.agentDownloadUrl;

  if (!agentUrl) {
    return NextResponse.json(
      { error: "Agent download not configured" },
      { status: 503 }
    );
  }

  return NextResponse.redirect(agentUrl, 302);
}