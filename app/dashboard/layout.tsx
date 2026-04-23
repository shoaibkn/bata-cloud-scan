import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { requireOwnedTenant } from "@/lib/session";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/scanner", label: "Scanner" },
  { href: "/dashboard/site", label: "Minisite" },
  { href: "/dashboard/agent", label: "Agent" },
] as const;

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { tenant } = await requireOwnedTenant();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">Tenant control plane</p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.04em]">{tenant.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href={`http://${tenant.slug}.localhost:3000`} className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/75">
              Preview site
            </a>
            <LogoutButton />
          </div>
        </header>

        <nav className="flex flex-wrap gap-3">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/8">
              {link.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
