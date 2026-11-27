import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/Logo";
import { LoginForm } from "@/components/desk/LoginForm";
import { config } from "@/server/config";

export const metadata: Metadata = { title: "Desk sign in", robots: { index: false, follow: false } };

export default function DeskLogin() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-paper-2/50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-medium">Desk</span>
        </div>
        <p className="mt-2 text-sm text-ink-4">Internal tool. Authorized staff only.</p>
        <div className="mt-8">
          {config.desk.enabled ? (
            <LoginForm />
          ) : (
            <div className="rounded-lg bg-paper-2 p-4 text-sm leading-relaxed text-ink-4">
              The desk is switched off. Set <code className="font-mono text-ink">DESK_PASSWORD</code> (12+ characters) and{" "}
              <code className="font-mono text-ink">DESK_SECRET</code> (32+ characters) in <code className="font-mono text-ink">.env.local</code>, then restart.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
