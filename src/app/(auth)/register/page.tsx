import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/config/routes";
import { AuthNavbar } from "@/features/auth/components/auth-navbar";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create Account | Bebarter",
  description:
    "Join the Bebarter community — start your win-win journey connecting with local pet owners for bartering services and companionship.",
};

export default function RegisterPage(): JSX.Element {
  return (
    <>
      <AuthNavbar
        rightContent={
          <Link
            href="#"
            className="text-on-surface-variant hover:bg-surface-container px-4 py-2 rounded-full transition-colors font-semibold text-sm"
          >
            Help
          </Link>
        }
      />

      <main className="w-full flex-grow flex flex-col md:flex-row items-center justify-center pt-24 pb-12 px-6 gap-12 max-w-7xl mx-auto min-h-screen">
        {/* Left — Branding */}
        <section className="w-full md:w-1/2 flex flex-col space-y-8">
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-secondary-container opacity-20 rounded-full blur-3xl" />
            <h2 className="font-heading font-extrabold text-5xl md:text-6xl text-on-surface leading-[1.1] tracking-tight">
              Join the <span className="text-primary italic">Pack!</span>
            </h2>
            <p className="text-on-surface-variant text-xl mt-4 max-w-md leading-relaxed">
              Start your win-win journey today. Connect with local pet owners
              for bartering services and companionship.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-6 rounded-lg space-y-2">
              <span className="material-symbols-outlined text-primary text-3xl">
                handshake
              </span>
              <h3 className="font-bold text-on-surface">Skill Swapping</h3>
              <p className="text-sm text-on-surface-variant">
                Trade grooming for training.
              </p>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg space-y-2 mt-6">
              <span className="material-symbols-outlined text-secondary text-3xl">
                group
              </span>
              <h3 className="font-bold text-on-surface">Community</h3>
              <p className="text-sm text-on-surface-variant">
                Find your local tribe.
              </p>
            </div>
          </div>
        </section>

        {/* Right — Form */}
        <section className="w-full md:w-1/2 max-w-lg">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-lg shadow-ambient">
            <RegisterForm />
          </div>
        </section>
      </main>

      {/* Floating badge */}
      <div className="fixed bottom-10 right-10 hidden lg:flex items-center gap-3 bg-secondary-container text-on-secondary-container px-6 py-3 shadow-xl shadow-secondary/10 rotate-3 hover:rotate-0 transition-transform cursor-default rounded-[50px_20px_50px_20px]">
        <span className="material-symbols-outlined">volunteer_activism</span>
        <span className="font-bold tracking-tight font-heading">
          Win-Win Community
        </span>
      </div>

      {/* Background decoration */}
      <div className="fixed -bottom-20 -left-20 text-outline-variant/5 select-none pointer-events-none -rotate-12">
        <span
          className="material-symbols-outlined text-[300px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          pets
        </span>
      </div>
    </>
  );
}
