"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type TenantShowcaseProps = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  accentColor: string;
  panelColor: string;
  features: string[];
  contactEmail?: string | null;
  supportPhone?: string | null;
  hostname: string;
  scanHostname: string;
};

export function TenantShowcase(props: TenantShowcaseProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".hero-copy > *", {
        opacity: 0,
        y: 28,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.12,
      });

      gsap.from(".hero-panel", {
        opacity: 0,
        x: 48,
        duration: 1,
        ease: "power4.out",
      });

      gsap.from(".feature-chip", {
        opacity: 0,
        scale: 0.96,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.4,
      });
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      className="min-h-screen overflow-hidden px-6 py-8 text-white"
      style={{
        background: `radial-gradient(circle at top left, ${props.accentColor}22, transparent 26%), linear-gradient(160deg, #020617 0%, ${props.panelColor} 100%)`,
      }}
    >
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 rounded-[2rem] border border-white/10 bg-black/20 p-6 shadow-[0_30px_160px_rgba(0,0,0,0.35)] backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div className="hero-copy flex flex-col justify-between gap-10">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-white/65">{props.eyebrow}</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-[-0.04em] text-white md:text-7xl">
              {props.headline}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
              {props.subheadline}
            </p>
            <p className="max-w-xl text-base leading-7 text-white/55">{props.body}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {props.features.map((feature) => (
              <span
                key={feature}
                className="feature-chip rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm text-white/80"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={props.ctaHref}
              className="rounded-full px-6 py-3 text-sm font-semibold text-slate-950"
              style={{ backgroundColor: props.accentColor }}
            >
              {props.ctaLabel}
            </a>
            <div className="text-sm text-white/55">
              Scanner endpoint: <span className="text-white">{props.scanHostname}:9100</span>
            </div>
          </div>
        </div>

        <div className="hero-panel flex flex-col justify-between rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.35em] text-white/45">Tenant network profile</p>
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: props.accentColor }} />
            </div>

            <div className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Site hostname</p>
                <p className="mt-2 text-xl text-white">{props.hostname}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Scan hostname</p>
                <p className="mt-2 text-xl text-white">{props.scanHostname}:9100</p>
              </div>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 text-sm text-white/70">
              <p>Use the scanner hostname on Android devices and keep the ERP reader service bound to port 9100 on the local Windows server.</p>
              <p>Landing pages stay branded here while routing and billing remain centralized in the control plane.</p>
            </div>
          </div>

          <div className="grid gap-2 border-t border-white/10 pt-6 text-sm text-white/65">
            <p>{props.contactEmail ? `Contact: ${props.contactEmail}` : "Contact email set from tenant dashboard"}</p>
            <p>{props.supportPhone ? `Phone: ${props.supportPhone}` : "Phone support optional"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
