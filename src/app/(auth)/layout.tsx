import type { ReactNode } from "react";

import { fontBody, fontHeading } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface IAuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: IAuthLayoutProps): JSX.Element {
  return (
    <>
      {/* Material Symbols — scoped to auth pages */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
      />
      <div
        className={cn(
          fontHeading.variable,
          fontBody.variable,
          "min-h-screen bg-surface",
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm3.5 4c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z' fill='%23a82b49' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      >
        {children}
      </div>
    </>
  );
}
