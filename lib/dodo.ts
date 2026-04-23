import { env } from "@/lib/env";

export function getBillingConfig() {
  return {
    apiKey: env.dodoApiKey,
    environment: env.dodoEnvironment,
    returnUrl: env.dodoReturnUrl,
    productId: env.dodoPlanProductId,
  };
}

export function canCreateCheckout() {
  const config = getBillingConfig();

  return Boolean(config.apiKey && config.productId);
}
