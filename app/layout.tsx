import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/components/top-nav";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AdmitConnect",
  description: "Affordable 1-on-1 mentorship from U.S. scholarship admits"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:py-4 lg:px-6">
            <Link href="/" className="text-lg font-extrabold tracking-tight">
              AdmitConnect
            </Link>
            <TopNav />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
