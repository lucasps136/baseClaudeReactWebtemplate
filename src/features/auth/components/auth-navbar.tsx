import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/config/routes";

/**
 * Props for the AuthNavbar component.
 * SRP: Defines the contract for the auth navigation bar.
 */
interface IAuthNavbarProps {
  /** Whether to show a back button on the left side */
  showBackButton?: boolean;
  /** Custom href for the back button (defaults to login) */
  backHref?: string;
  /** Optional content rendered on the right side of the navbar */
  rightContent?: ReactNode;
}

/**
 * Shared navigation bar for all authentication pages.
 * SRP: Responsible only for rendering the auth-scoped top navigation.
 *
 * Follows Style Guide:
 * - Glassmorphism: surface-container-lowest at 80% opacity + backdrop-blur
 * - Ambient shadow from design tokens
 * - Logo uses primary color with heading font
 */
export function AuthNavbar({
  showBackButton = false,
  backHref = routes.auth.login,
  rightContent,
}: IAuthNavbarProps): JSX.Element {
  return (
    <header className="bg-surface-container-lowest/80 backdrop-blur-md fixed top-0 w-full z-50 shadow-ambient">
      <div className="flex items-center justify-between px-6 h-16 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={backHref as any}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container transition-colors active:scale-95 duration-200"
            >
              <span className="material-symbols-outlined text-on-surface">
                arrow_back
              </span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
            >
              pets
            </span>
            <span className="font-heading font-black text-2xl text-primary tracking-tighter">
              Boilerplate
            </span>
          </div>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
