import type { Metadata } from "next";
import Link from "next/link";
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
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link href="/mentors">Find a mentor</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/book">Book</Link>
            <Link href="/applicant">Applicant</Link>
            <Link href="/mentor/dashboard">Mentor</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
