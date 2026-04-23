"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        });
      }}
      className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
