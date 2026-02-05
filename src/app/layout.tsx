import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Paolo Life Dashboard",
  description: "Personal life dashboard — track habits, goals, and daily progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body className={`${geistSans.variable} font-sans antialiased bg-[#0a0a0a] text-white`}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
