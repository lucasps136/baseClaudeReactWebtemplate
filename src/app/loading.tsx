/**
 * Global loading UI component
 * Displayed while pages are loading
 */
export default function Loading(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>

        {/* Loading text */}
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
