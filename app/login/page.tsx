import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(210,255,114,0.14),_transparent_20%),linear-gradient(180deg,_#020617_0%,_#08101f_100%)] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 md:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/45">Sign in</p>
          <h1 className="font-display max-w-xl text-5xl font-semibold tracking-[-0.05em] text-white md:text-6xl">
            Manage your scanner endpoint and team access.
          </h1>
          <p className="max-w-lg text-lg leading-8 text-white/62">
            Sign in to access your dashboard, configure your scanner endpoint, and manage your team.
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
