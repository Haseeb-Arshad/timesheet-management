import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timesheet Management",
  description: "Manage your timesheets efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased font-sans`}
        style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
