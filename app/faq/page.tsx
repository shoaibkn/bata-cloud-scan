import Link from "next/link";

const faqs = [
  {
    question: "What is Lumin8 SVS?",
    answer:
      "Lumin8 SVS is an independent scanner routing service that lets vendors scan products for Bata SVS ERP from any location. It provides a cloud endpoint that your Android scanner connects to, routing scan data to your ERP inventory without VPN.",
  },
  {
    question: "How does remote scanning work?",
    answer:
      "Point your Android barcode scanner at your endpoint address (scan.company.svs.lumin8.in:9100). Scanned barcodes are sent to the cloud endpoint and forwarded to your Bata SVS ERP inventory. No VPN or network configuration needed.",
  },
  {
    question: "Do I need to be on the same network as my Bata SVS ERP server?",
    answer:
      "No. Lumin8 SVS is designed specifically for vendors who work outside the ERP network. As long as your scanner can reach the internet, you can scan products remotely.",
  },
  {
    question: "What barcode scanners work with this service?",
    answer:
      "Any Android scanner that can send data over TCP to a hostname and port. Configure your scanner to point at scan.company.svs.lumin8.in:9100 and it will work with Bata SVS ERP.",
  },
  {
    question: "How does billing work?",
    answer:
      "We use an approval-first workflow. Sign up, request your endpoint, get approved, then complete payment. This ensures your endpoint is set up correctly before billing.",
  },
  {
    question: "What if my public IP changes frequently?",
    answer:
      "For vendors with dynamic IP addresses, we offer a Windows agent that runs on your local machine and keeps the DNS updated automatically. This ensures your endpoint always points to the right location.",
  },
  {
    question: "Is this service related to Barcode India Private Limited?",
    answer:
      "No. Lumin8 SVS is an independent service. We are not affiliated with, endorsed by, or connected to Barcode India Private Limited in any way.",
  },
  {
    question: "How do I get started?",
    answer:
      "Sign up for an account, request your scanner endpoint, and complete the approval workflow. Once approved and paid, configure your scanner to point at your endpoint address.",
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(210,255,114,0.14),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#030712_100%)] px-6 py-12 text-white md:py-20">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-4">
          <Link
            href="/"
            className="font-display text-sm font-semibold tracking-[0.18em] text-lime-200"
          >
            LUMIN8 SVS
          </Link>
          <h1 className="font-display text-5xl font-semibold tracking-[-0.05em] md:text-6xl">
            Frequently asked questions.
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-white/65">
            Find answers to common questions about Lumin8 SVS. Can&apos;t find what you&apos;re looking for?{" "}
            <a
              href="mailto:hello@lumin8.in"
              className="text-lime-200 underline underline-offset-4"
            >
              Contact us
            </a>
            .
          </p>
        </header>

        <dl className="grid gap-8">
          {faqs.map((faq) => (
            <div key={faq.question} className="space-y-2">
              <dt className="text-lg font-semibold">{faq.question}</dt>
              <dd className="text-white/60">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="font-display text-2xl font-semibold">Ready to get started?</h2>
          <p className="mt-2 text-white/60">
            Create your account and start scanning remotely in minutes.
          </p>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950"
            >
              Get started
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}