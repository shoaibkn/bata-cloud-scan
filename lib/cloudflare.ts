import { env } from "@/lib/env";

type CloudflareRecordInput = {
  hostname: string;
  ipAddress: string;
  proxied?: boolean;
};

async function cloudflareFetch(path: string, init?: RequestInit) {
  if (!env.cloudflareApiToken || !env.cloudflareZoneId) {
    return null;
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${env.cloudflareZoneId}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${env.cloudflareApiToken}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Cloudflare request failed: ${response.status}`);
  }

  return response.json();
}

export async function upsertScanDnsRecord(input: CloudflareRecordInput) {
  if (!env.cloudflareApiToken || !env.cloudflareZoneId) {
    return { skipped: true, recordId: null };
  }

  const payload = {
    type: "A",
    name: input.hostname,
    content: input.ipAddress,
    ttl: 120,
    proxied: input.proxied ?? false,
  };

  const search = await cloudflareFetch(
    `/dns_records?type=A&name=${encodeURIComponent(input.hostname)}`,
  );

  const existingRecord = search?.result?.[0];

  if (existingRecord?.id) {
    const updated = await cloudflareFetch(`/dns_records/${existingRecord.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return { skipped: false, recordId: updated?.result?.id ?? existingRecord.id };
  }

  const created = await cloudflareFetch("/dns_records", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return { skipped: false, recordId: created?.result?.id ?? null };
}
