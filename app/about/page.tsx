import Link from "next/link";
import { ArrowRight, CheckCircle, Globe, Wifi } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(210,255,114,0.14),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#030712_100%)] px-6 py-12 text-white md:py-20">
      <div className="mx-auto max-w-5xl space-y-16">
        <header className="space-y-6">
          <Link
            href="/"
            className="font-display text-sm font-semibold tracking-[0.18em] text-lime-200"
          >
            LUMIN8 SVS
          </Link>
          <h1 className="font-display text-5xl font-semibold tracking-[-0.05em] md:text-6xl">
            Remote barcode scanning for Bata SVS ERP.
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-white/65">
            Lumin8 SVS is an independent service that helps vendors scan products for Bata SVS ERP from anywhere. Connect your barcode scanner to a cloud endpoint and work from any location without VPN or complex network setup.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Globe,
              title: "Remote access",
              description:
                "Scan products from any location. Your scanner connects to the cloud endpoint, and data flows directly to your Bata SVS ERP inventory.",
            },
            {
              icon: Wifi,
              title: "No VPN needed",
              description:
                "No complicated network setup. Point your Android scanner at the endpoint and start scanning immediately.",
            },
            {
              icon: CheckCircle,
              title: "Bata SVS ready",
              description:
                "Built specifically for Bata SVS ERP users. Works with your existing scanner hardware and inventory workflow.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6"
            >
              <item.icon className="h-6 w-6 text-lime-200" />
              <h2 className="mt-4 text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="font-display text-3xl font-semibold">How it works</h2>
          <ol className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Sign up",
                description:
                  "Create your account and request access to the scanning service.",
              },
              {
                step: "02",
                title: "Get approved",
                description:
                  "Your request is reviewed and approved to activate your endpoint.",
              },
              {
                step: "03",
                title: "Configure scanner",
                description:
                  "Point your Android scanner at scan.company.svs.lumin8.in:9100.",
              },
              {
                step: "04",
                title: "Start scanning",
                description:
                  "Scan products from anywhere. Data sends directly to Bata SVS ERP.",
              },
            ].map((item) => (
              <li key={item.step} className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">
                  {item.step}
                </p>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-white/60">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-[2rem] border border-amber-200/20 bg-amber-200/10 p-6">
          <h2 className="font-display text-xl font-semibold text-amber-200">Independent service notice</h2>
          <p className="mt-2 text-white/60">
            Lumin8 SVS is an independent scanner routing service for Bata SVS ERP users. We are not affiliated with, endorsed by, or connected to Barcode India Private Limited in any way.
          </p>
        </section>

        <section className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-6 py-3 text-sm font-medium text-white/80"
          >
            View pricing
          </Link>
        </section>
      </div>
    </main>
  );
}