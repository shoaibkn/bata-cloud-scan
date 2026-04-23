"use client";

import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

import { env } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: env.betterAuthUrl,
  plugins: [magicLinkClient()],
});
