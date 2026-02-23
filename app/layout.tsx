import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdmitConnect",
  description: "Affordable 1-on-1 mentorship from U.S. scholarship admits"
};

function NavMenu({
  title,
  items
}: {
  title: string;
  items: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="nav-menu">
      <button type="button" className="nav-trigger">{title}</button>
      <div className="nav-dropdown">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="nav-dropdown-link">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

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

          <nav className="top-nav">
            <NavMenu
              title="For Students"
              items={[
                { href: "/mentors", label: "Find a mentor" },
                { href: "/book", label: "Book a session" },
                { href: "/applicant", label: "Student dashboard" },
                { href: "/pricing", label: "Pricing" }
              ]}
            />

            <NavMenu
              title="For Tutors"
              items={[
                { href: "/tutor/apply", label: "Tutor application" },
                { href: "/mentor/dashboard", label: "Tutor dashboard" }
              ]}
            />

            <NavMenu
              title="About Us"
              items={[
                { href: "/faq", label: "FAQ" },
                { href: "/trust-safety", label: "Trust & Safety" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
                { href: "/refund-policy", label: "Refund policy" }
              ]}
            />

            <NavMenu
              title="Sign Up / Login"
              items={[
                { href: "/signup", label: "Create account" },
                { href: "/login", label: "Login" },
                { href: "/admin/verification", label: "Admin review" }
              ]}
            />
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
