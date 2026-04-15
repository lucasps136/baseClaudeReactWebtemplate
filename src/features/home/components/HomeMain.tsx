"use client";

import { useAuthState } from "@/shared/components/providers/auth-provider";

import { HomeWelcome } from "./HomeWelcome";

// Placeholder home page — replace with real content when features are ready
export const HomeMain = (): JSX.Element => {
  const { user } = useAuthState();

  return (
    <main className="container mx-auto px-4 py-8">
      <HomeWelcome user={user} />
    </main>
  );
};
