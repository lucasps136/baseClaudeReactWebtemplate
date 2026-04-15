"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IUser } from "@/shared/types/auth";

interface IHomeWelcomeProps {
  user: IUser | null;
}

// SRP: renders the welcome banner only
export const HomeWelcome = ({ user }: IHomeWelcomeProps): JSX.Element => {
  const displayName = user?.name ?? user?.email ?? "there";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          Welcome back, {displayName}!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          You are now logged in. This page is a placeholder — real content
          coming soon.
        </p>
      </CardContent>
    </Card>
  );
};
