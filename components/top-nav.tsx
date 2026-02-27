"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import type { AppRole } from "@/lib/auth-store";

type NavItem = { href: Route; label: string };
type NavGroup = { key: string; title: string; items: NavItem[] };
type Viewer = { name: string | null; email?: string | null; role: AppRole | null } | null;

const navGroups: NavGroup[] = [
  {
    key: "students",
    title: "For Students",
    items: [
      { href: "/mentors", label: "Find a mentor" },
      { href: "/book", label: "Book a session" },
      { href: "/applicant", label: "Student dashboard" },
      { href: "/pricing", label: "Pricing" },
      { href: "/messages/student", label: "Student messages" }
    ]
  },
  {
    key: "tutors",
    title: "For Tutors",
    items: [
      { href: "/tutor/apply", label: "Tutor application" },
      { href: "/mentor/dashboard", label: "Tutor dashboard" },
      { href: "/messages/tutor", label: "Tutor messages" }
    ]
  },
  {
    key: "about",
    title: "About Us",
    items: [
      { href: "/faq", label: "FAQ" },
      { href: "/trust-safety", label: "Trust & Safety" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund-policy", label: "Refund policy" }
    ]
  },
  {
    key: "auth",
    title: "Sign Up / Login",
    items: [
      { href: "/signup", label: "Create account" },
      { href: "/login", label: "Login" },
      { href: "/admin/verification", label: "Admin review" }
    ]
  }
];

export default function TopNav() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [isLoadingViewer, setIsLoadingViewer] = useState(true);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    async function loadViewer() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        setViewer(null);
        setIsLoadingViewer(false);
        return;
      }

      const payload = (await response.json()) as { data: Viewer };
      setViewer(payload.data);
      setIsLoadingViewer(false);
    }

    loadViewer();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenKey(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenKey(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    setAuthMessage(null);
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (!response.ok) {
      setAuthMessage("Unable to logout right now. Please try again.");
      return;
    }

    setViewer(null);
    setAuthMessage("Logged out.");
  }

  return (
    <>
      <nav className="top-nav" ref={navRef}>
        {navGroups.map((group) => {
          const isOpen = openKey === group.key;
          return (
            <div className="nav-menu" key={group.key}>
              <button
                type="button"
                className="nav-trigger"
                aria-expanded={isOpen}
                onClick={() => setOpenKey(isOpen ? null : group.key)}
              >
                {group.title}
              </button>
              {isOpen && (
                <div className="nav-dropdown">
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} className="nav-dropdown-link" onClick={() => setOpenKey(null)}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="auth-chip" aria-live="polite">
          {!isLoadingViewer && !viewer && <span className="muted">Guest</span>}
          {isLoadingViewer && <span className="muted">Checking session...</span>}
          {viewer && (
            <>
              <span>{viewer.name || viewer.email}</span>
              {viewer.role && <span className="badge">{viewer.role}</span>}
              <button type="button" onClick={handleLogout} className="btn btn-subtle">Logout</button>
            </>
          )}
        </div>
      </nav>
      {authMessage && <p className="container muted" style={{ marginTop: "0.2rem" }}>{authMessage}</p>}
    </>
  );
}
