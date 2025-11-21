"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface IErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary component
 * Catches and displays errors in the application
 */
export default function Error({ error, reset }: IErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">
            Something went wrong!
          </CardTitle>
          <CardDescription>
            An unexpected error occurred. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <details className="rounded-md border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Error Details
              </summary>
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              Go to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
