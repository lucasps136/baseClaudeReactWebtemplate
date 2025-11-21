"use client";

import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { DatabaseProvider } from "./database-provider";

interface IRootProviderProps {
  children: React.ReactNode;
}

/**
 * Root provider that wraps all other providers
 * Following the Composite pattern for provider composition
 * SOLID: Single Responsibility (composição de providers)
 * DIP: Providers podem ser trocados via configuração
 */
export function RootProvider({ children }: IRootProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DatabaseProvider>
        <AuthProvider>{children}</AuthProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
