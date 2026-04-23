"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSignup = mode === "signup";

  async function handleEmailPassword(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");

    if (!email || !password || (isSignup && !name)) {
      setError("Complete the required fields first.");
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = isSignup
        ? await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/request-tenant",
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
          });

      if (response.error) {
        setError(response.error.message ?? "Authentication failed.");
        return;
      }

      router.push(isSignup ? "/request-tenant" : "/dashboard");
      router.refresh();
    });
  }

  async function handleMagicLink(formData: FormData) {
    const email = String(formData.get("magicEmail") ?? "");

    if (!email) {
      setError("Enter your email to receive a sign-in link.");
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = await authClient.signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });

      if (response.error) {
        setError(response.error.message ?? "Unable to send magic link.");
        return;
      }

      setMessage("Check your email for the sign-in link.");
    });
  }

  return (
    <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-lime-200/70">
          {isSignup ? "Create owner account" : "Sign in to the platform"}
        </p>
        <h1 className="text-4xl font-semibold text-white">
          {isSignup ? "Start your tenant request." : "Enter the control room."}
        </h1>
      </div>

      <form action={handleEmailPassword} className="grid gap-4">
        {isSignup ? (
          <label className="grid gap-2 text-sm text-white/80">
            Full name
            <input
              className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/30"
              name="name"
              placeholder="Your full name"
            />
          </label>
        ) : null}

        <label className="grid gap-2 text-sm text-white/80">
          Email
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/30"
            name="email"
            type="email"
            placeholder="owner@tenant.com"
          />
        </label>

        <label className="grid gap-2 text-sm text-white/80">
          Password
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/30"
            name="password"
            type="password"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "rounded-full bg-lime-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-lime-200",
            isPending && "opacity-60",
          )}
        >
          {isPending ? "Working..." : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
        <div>
          <p className="text-sm font-medium text-white">Magic link access</p>
          <p className="text-sm text-white/60">
            Useful for owners who do not want passwords on kiosk-adjacent machines.
          </p>
        </div>

        <form action={handleMagicLink} className="flex flex-col gap-3 sm:flex-row">
          <input
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/30"
            name="magicEmail"
            type="email"
            placeholder="owner@tenant.com"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Send link
          </button>
        </form>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="text-sm text-lime-200">{message}</p> : null}

      <p className="text-sm text-white/50">
        {isSignup ? "Already have an account?" : "Need an account first?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-white underline underline-offset-4"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
