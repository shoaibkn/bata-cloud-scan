import { createHash, randomBytes } from "node:crypto";

export function makeId() {
  return crypto.randomUUID();
}

export function makeToken(length = 24) {
  return randomBytes(length).toString("hex");
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
