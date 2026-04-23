import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const tenantStatusEnum = pgEnum("tenant_status", [
  "pending_review",
  "approved_pending_payment",
  "active",
  "payment_past_due",
  "suspended",
  "rejected",
  "cancelled",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "active",
  "past_due",
  "cancelled",
  "expired",
]);

export const domainTypeEnum = pgEnum("domain_type", ["site", "scan"]);

export const ipSourceEnum = pgEnum("ip_source", ["manual", "agent"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [uniqueIndex("session_token_idx").on(table.token)],
);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  ...timestamps,
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export const tenants = pgTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    status: tenantStatusEnum("status").default("pending_review").notNull(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    requestNotes: text("request_notes"),
    reviewNotes: text("review_notes"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("tenants_owner_user_id_idx").on(table.ownerUserId)],
);

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" })
    .unique(),
  status: subscriptionStatusEnum("status").default("pending").notNull(),
  provider: text("provider").default("dodo_payments").notNull(),
  providerCustomerId: text("provider_customer_id"),
  providerSubscriptionId: text("provider_subscription_id"),
  productId: text("product_id"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  ...timestamps,
});

export const domains = pgTable(
  "domains",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    hostname: text("hostname").notNull().unique(),
    type: domainTypeEnum("type").notNull(),
    cloudflareRecordId: text("cloudflare_record_id"),
    proxied: boolean("proxied").default(false).notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("domains_tenant_type_idx").on(table.tenantId, table.type)],
);

export const scannerEndpoints = pgTable("scanner_endpoints", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" })
    .unique(),
  publicIp: text("public_ip"),
  port: integer("port").default(9100).notNull(),
  ipSource: ipSourceEnum("ip_source").default("manual").notNull(),
  lastObservedPublicIp: text("last_observed_public_ip"),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  mismatchWarning: boolean("mismatch_warning").default(false).notNull(),
  ...timestamps,
});

export const siteContent = pgTable("site_content", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" })
    .unique(),
  headline: text("headline").notNull(),
  eyebrow: text("eyebrow").notNull(),
  subheadline: text("subheadline").notNull(),
  body: text("body").notNull(),
  ctaLabel: text("cta_label").notNull(),
  ctaHref: text("cta_href").notNull(),
  accentColor: text("accent_color").notNull(),
  panelColor: text("panel_color").notNull(),
  contactEmail: text("contact_email"),
  supportPhone: text("support_phone"),
  features: jsonb("features").$type<string[]>().default(["ERP bridge", "Scanner-ready", "Admin-managed DNS"]).notNull(),
  ...timestamps,
});

export const agentInstalls = pgTable("agent_installs", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" })
    .unique(),
  tokenHash: text("token_hash").notNull(),
  plainToken: text("plain_token").notNull(),
  machineName: text("machine_name"),
  version: text("version"),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  lastPublicIp: text("last_public_ip"),
  localReaderReachable: boolean("local_reader_reachable"),
  ...timestamps,
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
  ...timestamps,
});

export type TenantStatus = (typeof tenantStatusEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];
