import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-provider";

export const metadata: Metadata = {
  title: "Llamame — Smart Scheduling for Professionals",
  description:
    "AI-powered scheduling with meeting briefs, client intelligence, WhatsApp booking, and energy-aware scheduling. Built for professionals who respect their time.",
  keywords: [
    "scheduling",
    "calendar",
    "booking",
    "AI",
    "meeting prep",
    "WhatsApp",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
