import Link from "next/link";
import { ArrowRight, Barcode, Globe, Smartphone, Wifi } from "lucide-react";

import { getServerSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getServerSession();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(210,255,114,0.14),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#030712_100%)] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-8 md:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <Link href="/" className="font-display text-lg font-semibold tracking-[0.18em] text-lime-200">
            LUMIN8 SVS
          </Link>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <Link href="/about" className="hidden sm:block">
              About
            </Link>
            <Link href="/faq" className="hidden sm:block">
              FAQ
            </Link>
            <Link href="/pricing" className="hidden sm:block">
              Pricing
            </Link>
            <Link
              href={session ? "/dashboard" : "/login"}
              className="rounded-full border border-white/12 px-4 py-2 transition hover:bg-white/10"
            >
              {session ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-lime-200/20 bg-lime-200/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-lime-100/80">
              Bata SVS ERP Scanner Service
            </div>
            <div className="space-y-5">
              <h1 className="font-display max-w-4xl text-5xl font-semibold leading-none tracking-[-0.05em] text-white md:text-7xl">
                Scan products for Bata SVS ERP from anywhere outside your network.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/65 md:text-xl">
                Lumin8 SVS lets vendors use barcode scanners with Bata SVS ERP from any location. Connect your handheld scanner to a cloud endpoint and scan products remotely without VPN, no matter where your team works.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href={session ? "/request-tenant" : "/signup"}
                className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-200"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_120px_rgba(0,0,0,0.35)] backdrop-blur">
            {[
              {
                icon: Wifi,
                title: "Remote scanning",
                body: "Use your barcode scanner from anywhere. No VPN needed, just connect to the cloud endpoint.",
              },
              {
                icon: Smartphone,
                title: "Any Android device",
                body: "Point your Android scanner at scan.company.svs.lumin8.in:9100 and start scanning.",
              },
              {
                icon: Barcode,
                title: "Bata SVS ready",
                body: "Works with Bata SVS ERP Software. Your scanner sends data directly to your ERP inventory.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-white/8 bg-slate-950/50 p-5"
              >
                <item.icon className="h-5 w-5 text-lime-200" />
                <h2 className="mt-5 text-xl font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-white/60">{item.body}</p>
              </article>
            ))}
          </div>
        </div>

        <footer className="mt-12 space-y-2 rounded-[1.5rem] border border-amber-200/20 bg-amber-200/10 p-6">
          <p className="text-sm font-medium text-amber-200">Independent service notice</p>
          <p className="text-sm text-amber-200/80">
            Lumin8 SVS is an independent scanner routing service for Bata SVS ERP users. We are not affiliated with, endorsed by, or connected to Barcode India Private Limited in any way.
          </p>
        </footer>
      </section>
    </main>
  );
}