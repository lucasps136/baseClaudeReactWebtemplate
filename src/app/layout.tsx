import type { Metadata } from "next";
import "./globals.css";

import { RootProvider } from "@/components/providers/root-provider";
import { fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "Next.js SOLID Boilerplate",
    template: "%s | Next.js SOLID Boilerplate",
  },
  description: "Modern Next.js boilerplate with SOLID architecture principles",
  keywords: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "SOLID",
  ],
  authors: [
    {
      name: "Your Name",
      url: "https://yourwebsite.com",
    },
  ],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Next.js SOLID Boilerplate",
    description:
      "Modern Next.js boilerplate with SOLID architecture principles",
    siteName: "Next.js SOLID Boilerplate",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js SOLID Boilerplate",
    description:
      "Modern Next.js boilerplate with SOLID architecture principles",
    creator: "@yourusername",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fontSans.className,
          "min-h-screen bg-background antialiased",
        )}
      >
        <RootProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </RootProvider>
      </body>
    </html>
  );
}
