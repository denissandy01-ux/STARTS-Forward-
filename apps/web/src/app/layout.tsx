import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "@copilotkit/react-core/v2/styles.css";
import "./globals.css";
import { bridgeConfig } from "@/lib/server/bridge-config";

export const metadata: Metadata = {
  title: "STARTS Forward — Shared purpose. Collective progress.",
  description: "Connect community priorities, public health careers and service delivery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers enabled={bridgeConfig().live}>{children}</Providers>
      </body>
    </html>
  );
}
