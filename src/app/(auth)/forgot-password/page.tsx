import type { Metadata } from "next";

import { routes } from "@/config/routes";
import { AuthNavbar } from "@/features/auth/components/auth-navbar";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Boilerplate",
  description:
    "Reset your Boilerplate account password — we'll send you a secure link to get back in.",
};

export default function ForgotPasswordPage(): JSX.Element {
  return (
    <>
      <AuthNavbar
        showBackButton
        backHref={routes.auth.login}
        rightContent={
          <span className="hidden md:block font-heading text-on-surface-variant text-sm font-semibold">
            Support
          </span>
        }
      />

      <main className="min-h-screen pt-24 pb-12 flex items-center justify-center px-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left — mascot card (desktop only) */}
          <div className="hidden md:flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full blur-3xl -z-10" />
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-surface-container-low shadow-2xl relative group">
              <div className="w-full h-full bg-gradient-to-br from-surface to-secondary-container/30 flex items-center justify-center">
                <div className="text-center p-12">
                  <span
                    className="material-symbols-outlined text-primary block mb-6"
                    style={{
                      fontSize: "8rem",
                      fontVariationSettings:
                        "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48",
                    }}
                  >
                    pets
                  </span>
                  <p className="font-heading text-4xl font-black text-primary">
                    Boilerplate
                  </p>
                  <p className="text-on-surface-variant mt-2">
                    Finding your way back
                  </p>
                </div>
              </div>

              {/* Glass overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-surface-container-lowest/40 backdrop-blur-xl rounded-lg shadow-lg">
                <p className="text-on-surface font-heading font-bold text-lg leading-tight">
                  &ldquo;Don&apos;t worry, human. I&apos;ll help you find your
                  way back!&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-8 h-1 bg-primary rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Blue, Head of Fetching
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="flex flex-col">
            <div className="mb-8 space-y-4">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-on-surface tracking-tight leading-[1.1]">
                Forgot your password?{" "}
                <span className="text-primary block">No zoomies!</span>
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                It happens to the best of us! Tell me your email and I&apos;ll
                fetch a reset link for you.
              </p>
            </div>

            <ForgotPasswordForm />

            {/* Security badge */}
            <div className="mt-12 flex items-center justify-center md:justify-start">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-secondary-container rounded-full shadow-sm">
                <span className="material-symbols-outlined text-on-secondary-container">
                  verified_user
                </span>
                <p className="text-sm font-bold text-on-secondary-container font-heading">
                  Secure &amp; Private Fetching
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
