import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendAuthEmail } from "@/lib/email";

export const auth = betterAuth({
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendAuthEmail({
          email,
          subject: "Your Lumin8 SVS sign-in link",
          html: `<p>Use the secure link below to sign in.</p><p><a href="${url}">${url}</a></p>`,
          text: `Use this secure sign-in link: ${url}`,
        });
      },
    }),
  ],
});
