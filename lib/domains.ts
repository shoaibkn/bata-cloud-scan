import { env } from "@/lib/env";

const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "scan"]);

function stripPort(host: string) {
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export function buildSiteHostname(slug: string) {
  return `${slug}.${env.rootDomain}`;
}

export function buildScanHostname(slug: string) {
  return `scan.${slug}.${env.rootDomain}`;
}

export function extractTenantSlugFromHost(host: string) {
  const normalizedHost = stripPort(host);
  const rootDomain = env.rootDomain.toLowerCase();

  if (
    !normalizedHost ||
    normalizedHost === rootDomain ||
    normalizedHost === "localhost"
  ) {
    return null;
  }

  if (normalizedHost.endsWith(`.${rootDomain}`)) {
    const subdomain = normalizedHost.replace(`.${rootDomain}`, "");

    if (!subdomain || subdomain.includes(".") || RESERVED_SUBDOMAINS.has(subdomain)) {
      return null;
    }

    return subdomain;
  }

  if (normalizedHost.endsWith(".localhost")) {
    const subdomain = normalizedHost.replace(".localhost", "");

    if (!subdomain || subdomain.includes(".")) {
      return null;
    }

    return subdomain;
  }

  return null;
}

export function isReservedHost(host: string) {
  const normalizedHost = stripPort(host);
  const rootDomain = env.rootDomain.toLowerCase();

  return (
    !normalizedHost ||
    normalizedHost === rootDomain ||
    normalizedHost === "localhost" ||
    normalizedHost.startsWith("scan.")
  );
}
