import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/components/top-nav";
import "./globals.css";

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
    <html lang="en">
      <body>
        <header className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 800 }}>AdmitConnect</Link>
          <TopNav />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
