import { z } from "zod";

export const tenantRequestSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(3)
    .max(48)
    .regex(/^[a-z0-9-]+$/),
  notes: z.string().max(400).optional().default(""),
});

export const siteContentSchema = z.object({
  eyebrow: z.string().min(2).max(40),
  headline: z.string().min(6).max(120),
  subheadline: z.string().min(12).max(180),
  body: z.string().min(20).max(500),
  ctaLabel: z.string().min(2).max(30),
  ctaHref: z.string().url(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  panelColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  contactEmail: z.string().email().or(z.literal("")),
  supportPhone: z.string().max(40).optional().default(""),
  features: z.string().min(3).max(400),
});

export const scannerEndpointSchema = z.object({
  publicIp: z.ipv4(),
  port: z.coerce.number().int().min(1).max(65535).default(9100),
});
