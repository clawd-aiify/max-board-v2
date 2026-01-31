import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Max Command Center | Progress Board",
  description: "Multi-tenant OpenClaw deployment system with automated customer onboarding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
