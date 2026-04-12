import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "iFixOrlando",
    template: "%s | iFixOrlando",
  },
  description: "Foundation for the iFixOrlando web application.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "iFixOrlando",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
      <body
        className="min-h-full bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <ToastProvider>
          <ServiceWorkerRegister />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
