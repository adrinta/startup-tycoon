import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPanel } from "@/features/auth/login-panel";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-24 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Memuat…
        </div>
      }
    >
      <LoginPanel />
    </Suspense>
  );
}
