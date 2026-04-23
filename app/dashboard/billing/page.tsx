import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { getBillingConfig } from "@/lib/dodo";
import { requireOwnedTenant } from "@/lib/session";

export const dynamic = "force-dynamic";

const planDetails = {
  name: "Lumin8 SVS Platform",
  description: "Remote barcode scanning for Bata SVS ERP.",
  features: [
    "scan.company.svs.lumin8.in:9100 endpoint",
    "Remote access for your team",
    "Android scanner support",
    "Dashboard management",
    "Manual or agent-based IP sync",
    "Dodo-backed billing",
  ],
};

function buildCheckoutUrl(
  productId: string,
  tenantId: string,
  tenantSlug: string,
  returnUrl: string,
  isTestMode: boolean,
) {
  const base = isTestMode
    ? "https://test.checkout.dodopayments.com"
    : "https://checkout.dodopayments.com";
  const params = new URLSearchParams({
    metadata_tenantId: tenantId,
    metadata_slug: tenantSlug,
    return_url: returnUrl,
  });
  return `${base}/buy/${productId}?${params.toString()}`;
}

export default async function BillingPage() {
  const { tenant } = await requireOwnedTenant();
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.tenantId, tenant.id),
  });
  const billingConfig = getBillingConfig();

  const canCheckout = Boolean(
    billingConfig.apiKey &&
    billingConfig.productId &&
    tenant.status === "approved_pending_payment",
  );

  const checkoutHref =
    canCheckout && billingConfig.productId
      ? buildCheckoutUrl(
          billingConfig.productId,
          tenant.id,
          tenant.slug,
          `${billingConfig.returnUrl}?tenantId=${tenant.id}`,
          billingConfig.environment === "test_mode",
        )
      : null;

  const statusDisplay = subscription?.status ?? "pending";
  const statusColors: Record<string, string> = {
    pending: "text-white/60",
    active: "text-lime-300",
    past_due: "text-amber-300",
    cancelled: "text-rose-300",
    expired: "text-rose-300",
  };

  if (!canCheckout && billingConfig.apiKey) {
    return (
      <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">
            Billing
          </p>
          <h2 className="text-3xl font-semibold">Configuration needed</h2>
          <p className="max-w-2xl text-white/60">
            The checkout is ready but requires a product to be configured.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-200/20 bg-amber-200/10 p-6">
          <p className="text-sm text-amber-200">
            Your product needs to be configured for checkout. Please contact
            support to complete the billing setup.
          </p>
        </div>
      </section>
    );
  }

  if (!billingConfig.apiKey) {
    return (
      <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">
            Billing
          </p>
          <h2 className="text-3xl font-semibold">Setup required</h2>
          <p className="max-w-2xl text-white/60">
            The billing integration needs to be configured before checkout can
            open.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-rose-200/20 bg-rose-200/10 p-6">
          <p className="text-sm text-rose-200">
            Billing integration is not configured. Please contact support to
            enable payments.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">
          Billing
        </p>
        <h2 className="text-3xl font-semibold">Subscribe to activate.</h2>
        <p className="max-w-2xl text-white/60">
          Approve-first then charge second. Once paid, the tenant becomes active
          and scanner DNS can be managed.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            Current subscription
          </p>
          <div className="mt-4 flex items-center gap-3">
            <p
              className={`text-3xl font-semibold ${statusColors[statusDisplay]}`}
            >
              {statusDisplay.replace("_", " ")}
            </p>
            {subscription?.status === "active" ? (
              <Check className="h-5 w-5 text-lime-300" />
            ) : subscription?.status === "pending" ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/40" />
            ) : (
              <X className="h-5 w-5 text-rose-300" />
            )}
          </div>
          {subscription?.providerCustomerId && (
            <p className="mt-3 text-sm text-white/50">
              Customer ID: {subscription.providerCustomerId}
            </p>
          )}
          {subscription?.currentPeriodEnd && (
            <p className="mt-2 text-sm text-white/50">
              Current period ends:{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          <div className="mt-6 space-y-2">
            {planDetails.features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-white/70"
              >
                <Check className="h-4 w-4 text-lime-200/60" />
                {feature}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
            Checkout
          </p>
          <div className="mt-4">
            {tenant.status === "pending_review" ? (
              <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4">
                <p className="text-sm text-amber-200">
                  Waiting for admin approval. Complete the tenant request first,
                  then proceed to checkout.
                </p>
              </div>
            ) : tenant.status === "approved_pending_payment" ? (
              <div className="space-y-4">
                <p className="text-sm text-white/60">
                  Click to open the Dodo checkout. After successful payment,
                  your tenant will become active.
                </p>
                <a
                  href={checkoutHref!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-950"
                >
                  Open checkout
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : tenant.status === "active" ? (
              <div className="rounded-2xl border border-lime-200/20 bg-lime-200/10 p-4">
                <p className="text-sm text-lime-200">
                  Subscription is active. Scanner DNS can be configured in the
                  Scanner tab.
                </p>
              </div>
            ) : tenant.status === "suspended" ||
              tenant.status === "cancelled" ? (
              <div className="rounded-2xl border border-rose-200/20 bg-rose-200/10 p-4">
                <p className="text-sm text-rose-200">
                  Subscription {tenant.status}. Contact support to reactivate.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/50">
                  No checkout available for current status: {tenant.status}
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
