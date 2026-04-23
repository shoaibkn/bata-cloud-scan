import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_bottom_left,_rgba(210,255,114,0.14),_transparent_20%),linear-gradient(180deg,_#08101f_0%,_#020617_100%)] px-6 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 md:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/45">Create account</p>
          <h1 className="font-display max-w-xl text-5xl font-semibold tracking-[-0.05em] text-white md:text-6xl">
            Get remote scanning access for Bata SVS ERP.
          </h1>
          <p className="max-w-lg text-lg leading-8 text-white/62">
            Create an account to request your scanner endpoint. Your request will be reviewed before activation.
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
