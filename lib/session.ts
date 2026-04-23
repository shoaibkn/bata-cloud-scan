import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { env } from "@/lib/env";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export function isAdminEmail(email: string) {
  return env.adminEmails.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const session = await requireSession();

  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard");
  }

  return session;
}

export async function getOwnedTenant(userId: string) {
  return db.query.tenants.findFirst({
    where: eq(tenants.ownerUserId, userId),
  });
}

export async function requireOwnedTenant() {
  const session = await requireSession();
  const tenant = await getOwnedTenant(session.user.id);

  if (!tenant) {
    if (isAdminEmail(session.user.email)) {
      redirect("/admin");
    }

    redirect("/request-tenant");
  }

  return { session, tenant };
}
