const fallbackRootDomain = "svs.lumin8.in";

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://svs.lumin8.in",
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? fallbackRootDomain,
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:5432/l8_scan",
  betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? "development-secret",
  betterAuthUrl:
    process.env.BETTER_AUTH_URL ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth`,
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
  dodoApiKey: process.env.DODO_PAYMENTS_API_KEY,
  dodoWebhookSecret: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
  dodoEnvironment: (
    process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
      ? "live_mode"
      : "test_mode") as "live_mode" | "test_mode",
  dodoReturnUrl:
    process.env.DODO_PAYMENTS_RETURN_URL ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard/billing`,
  dodoPlanProductId: process.env.DODO_PAYMENTS_PLAN_PRODUCT_ID,
  cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
  cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  agentDownloadUrl: process.env.AGENT_DOWNLOAD_URL,
};

export function requireEnv(name: keyof typeof env) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
