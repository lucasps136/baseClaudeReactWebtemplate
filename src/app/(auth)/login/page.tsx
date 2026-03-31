import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/config/routes";
import { AuthNavbar } from "@/features/auth/components/auth-navbar";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login | Bebarter",
  description:
    "Sign in to Bebarter — connect with local pet owners for bartering services and companionship.",
};

export default function LoginPage(): JSX.Element {
  return (
    <>
      <AuthNavbar />

      <main className="min-h-screen flex items-center justify-center p-6 pt-24">
        <div className="w-full max-w-[420px] flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col items-center text-center">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
              <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{
                    fontSize: "3rem",
                    fontVariationSettings:
                      "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48",
                  }}
                >
                  pets
                </span>
              </div>
            </div>
            <h1 className="font-heading text-on-surface text-3xl font-extrabold tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-on-surface-variant font-medium">
              Ready to find some new friends for your pal?
            </p>
          </header>

          {/* Card */}
          <section className="bg-surface-container-lowest p-8 rounded-lg shadow-ambient flex flex-col gap-6">
            <LoginForm />
          </section>

          {/* Footer */}
          <footer className="text-center">
            <p className="text-on-surface-variant font-medium">
              New to the pack?{" "}
              <Link
                href={routes.auth.register}
                className="text-primary font-bold hover:underline underline-offset-4 ml-1"
              >
                Join the Pack
              </Link>
            </p>
          </footer>

          {/* Chip */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-secondary-container/30 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-secondary text-sm">
                pets
              </span>
              <span className="text-xs font-bold text-on-secondary-container font-heading">
                12,402 active pups nearby
              </span>
            </div>
          </div>
        </div>

        {/* Decorative background paw */}
        <div className="fixed bottom-8 right-8 hidden md:block pointer-events-none select-none">
          <span
            className="material-symbols-outlined text-primary opacity-5"
            style={{ fontSize: "9rem" }}
          >
            pets
          </span>
        </div>
      </main>
    </>
  );
}
