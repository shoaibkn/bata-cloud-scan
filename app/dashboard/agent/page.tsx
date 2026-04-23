import { Copy, Download, RefreshCw } from "lucide-react";
import { eq } from "drizzle-orm";

import { rotateAgentTokenAction } from "@/app/actions/tenant";
import { db } from "@/lib/db";
import { agentInstalls, tenants } from "@/lib/db/schema";
import { buildScanHostname } from "@/lib/domains";
import { formatDate } from "@/lib/utils";
import { requireOwnedTenant } from "@/lib/session";

type AgentPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AgentPage({ searchParams }: AgentPageProps) {
  const { tenant } = await requireOwnedTenant();
  const agent = await db.query.agentInstalls.findFirst({
    where: eq(agentInstalls.tenantId, tenant.id),
  });
  const params = await searchParams;
  const scanHostname = buildScanHostname(tenant.slug);

  return (
    <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">Windows agent</p>
        <h2 className="text-3xl font-semibold">Keep your scanner endpoint updated automatically.</h2>
        <p className="text-white/60">
          Download and install the Lumin8 Agent on your ERP machine. It monitors your public IP and keeps the scanner DNS record current.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Last heartbeat</p>
          <p className="mt-4 text-2xl font-semibold">{formatDate(agent?.lastSeenAt)}</p>
          <p className="mt-2 text-sm text-white/55">Last public IP: {agent?.lastPublicIp ?? "unknown"}</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">ERP reader check</p>
          <p className="mt-4 text-2xl font-semibold">
            {agent?.localReaderReachable === true
              ? "Reachable"
              : agent?.localReaderReachable === false
                ? "Offline"
                : "No data"}
          </p>
        </article>
      </div>

      <div className="rounded-[1.5rem] border border-lime-200/20 bg-lime-200/5 p-5">
        <p className="text-sm font-medium text-lime-100">Download Agent</p>
        <p className="mt-2 text-sm text-white/60">
          Download the self-contained Windows agent. Run it on the machine hosting your ERP reader service.
        </p>
        <a
          href="/download/agent"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-2 text-sm font-semibold text-slate-950"
        >
          <Download className="h-4 w-4" />
          Download Lumin8 Agent
        </a>
      </div>

      {params.token ? (
        <div className="rounded-[1.5rem] border border-lime-200/20 bg-lime-200/8 p-5">
          <p className="text-sm font-medium text-lime-100">Agent Token</p>
          <p className="mt-2 text-sm text-white/60">
            Copy this token and paste it into the agent config file after download.
          </p>
          <div className="mt-3 flex items-center gap-2 overflow-x-auto rounded-xl bg-slate-950/80 px-4 py-3 font-mono text-xs text-white">
            <code className="break-all">{params.token}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(params.token ?? "")}
              className="ml-2 shrink-0 rounded p-1 hover:bg-white/10"
              title="Copy token"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5">
        <p className="text-sm font-medium text-white">Setup Instructions</p>
        <ol className="mt-4 space-y-3 text-sm text-white/60">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">1</span>
            <span>Download and install the Lumin8 Agent on your ERP machine</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">2</span>
            <span>Open config.json in the agent folder and paste your agent token</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">3</span>
            <span>Run the agent. It will start sending heartbeats automatically</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">4</span>
            <span>Configure your Android scanner to use <code className="rounded bg-white/10 px-2 py-0.5">{scanHostname}:9100</code></span>
          </li>
        </ol>
      </div>

      <form action={rotateAgentTokenAction} className="flex">
        <button className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-2 text-sm text-white/80 transition hover:bg-white/10">
          <RefreshCw className="h-4 w-4" />
          Rotate agent token
        </button>
      </form>
    </section>
  );
}