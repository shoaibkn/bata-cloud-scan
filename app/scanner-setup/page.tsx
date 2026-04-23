import Link from "next/link";

export default function ScannerSetupPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white md:py-20">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-4">
          <Link
            href="/"
            className="font-display text-sm font-semibold tracking-[0.18em] text-lime-200"
          >
            LUMIN8 SVS
          </Link>
          <h1 className="font-display text-5xl font-semibold tracking-[-0.05em] md:text-6xl">
            Android Scanner Setup Guide
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-white/65">
            Configure your Android barcode scanner to connect to your Lumin8 SVS scanner endpoint.
            This guide works with most Android scanner devices that support TCP connections.
          </p>
        </header>

        <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="font-display text-3xl font-semibold">Quick Setup</h2>
          <ol className="space-y-6">
            {[
              {
                step: "1",
                title: "Open Scanner Settings",
                description: "Power on your Android scanner and navigate to the network or connection settings.",
              },
              {
                step: "2",
                title: "Select TCP Mode",
                description: "Choose TCP/IP or Network Connection mode (not Bluetooth or Serial).",
              },
              {
                step: "3",
                title: "Enter Host Address",
                description: 'Enter your scanner hostname, for example: scan.acme.svs.lumin8.in',
                code: "scan.{your-company}.svs.lumin8.in",
              },
              {
                step: "4",
                title: "Enter Port",
                description: "Set the port number to 9100.",
                code: "9100",
              },
              {
                step: "5",
                title: "Save and Test",
                description: 'Save the settings and scan a barcode to test the connection.',
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-200 font-semibold text-slate-950">
                  {item.step}
                </span>
                <div className="space-y-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                  {item.code ? (
                    <code className="inline-block rounded bg-white/10 px-3 py-1 text-sm text-lime-200">
                      {item.code}
                    </code>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="font-display text-3xl font-semibold">Scanner Configuration Examples</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                scanner: "Zebra TC21/TC26",
                steps: [
                  "Go to Settings > Scanning",
                  "Select Physical Scanner > Scanner Settings",
                  "Set Wedge Method to TCP Client",
                  "Enter IP: scan.{company}.svs.lumin8.in",
                  "Enter Port: 9100",
                ],
              },
              {
                scanner: "Honeywell EDA61K",
                steps: [
                  "Go to Start > Settings > Applications",
                  "Select Data Collection",
                  "Tap Protocol Settings",
                  "Select TCP Client",
                  "Enter Host: scan.{company}.svs.lumin8.in",
                  "Enter Port: 9100",
                ],
              },
              {
                scanner: "Datalogic Memor 25",
                steps: [
                  "Press MENU > Network",
                  "Select TCP/IP",
                  "Configure as TCP Client",
                  "Host: scan.{company}.svs.lumin8.in",
                  "Port: 9100",
                ],
              },
              {
                scanner: "Newland NLS",
                steps: [
                  "Go to Menu > Setup > Network",
                  "Select TCP Mode",
                  "Set Server IP to scan.{company}.svs.lumin8.in",
                  "Set Port to 9100",
                ],
              },
            ].map((item) => (
              <article
                key={item.scanner}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5"
              >
                <h3 className="font-semibold text-lime-200">{item.scanner}</h3>
                <ol className="mt-3 space-y-1 text-sm text-white/60">
                  {item.steps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-white/30">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-amber-200/20 bg-amber-200/10 p-6">
          <h2 className="font-display text-xl font-semibold text-amber-200">
            Troubleshooting
          </h2>
          <dl className="mt-4 space-y-4">
            {[
              {
                issue: "Connection refused",
                solution:
                  "Make sure your ERP reader service is running on port 9100. Check that no firewall is blocking the connection.",
              },
              {
                issue: "Scanner connects but no data",
                solution:
                  "Verify your ERP reader is configured to receive from the scanner. Check that the ERP software is in receive mode.",
              },
              {
                issue: "Slow or delayed scans",
                solution:
                  "Check your network connection. Try moving closer to your WiFi access point or checking internet speed.",
              },
              {
                issue: "Intermittent disconnects",
                solution:
                  "Ensure the agent is running and your public IP has not changed. If using dynamic IP, keep the Lumin8 Agent running.",
              },
            ].map((item) => (
              <div key={item.issue} className="space-y-1">
                <dt className="font-medium text-amber-200">{item.issue}</dt>
                <dd className="text-sm text-white/60">{item.solution}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="font-display text-2xl font-semibold">Need Help?</h2>
          <p className="mt-2 text-white/60">
            Contact us at{" "}
            <a
              href="mailto:hello@lumin8.in"
              className="text-lime-200 underline underline-offset-4"
            >
              hello@lumin8.in
            </a>{" "}
            for setup assistance.
          </p>
        </section>
      </div>
    </main>
  );
}