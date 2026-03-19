"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AppRole } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NavItem = { href: Route; label: string };
type NavGroup = { key: string; title: string; items: NavItem[] };
type Viewer = { name: string | null; email?: string | null; role: AppRole | null } | null;

const navGroups: NavGroup[] = [
  {
    key: "resources",
    title: "Resources",
    items: [
      { href: "/faq", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/trust-safety", label: "Trust & Safety" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund-policy", label: "Refund policy" }
    ]
  },
  {
    key: "dashboard",
    title: "Dashboard",
    items: [
      { href: "/book", label: "Bookings" },
      { href: "/messages/student", label: "Student messages" },
      { href: "/messages/tutor", label: "Tutor messages" },
      { href: "/student/onboarding", label: "Student onboarding" },
      { href: "/tutor/onboarding", label: "Tutor onboarding" },
      { href: "/tutor/availability", label: "Tutor availability" }
    ]
  }
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [isLoadingViewer, setIsLoadingViewer] = useState(true);
  const navRef = useRef<HTMLElement | null>(null);

  const loadViewer = useCallback(async () => {
    setIsLoadingViewer(true);

    try {
      const response = await fetch("/api/auth/me", { cache: "no-store", credentials: "include" });
      if (!response.ok) {
        setViewer(null);
        setIsLoadingViewer(false);
        return;
      }

      const payload = (await response.json()) as { data: Viewer };
      setViewer(payload.data);
      setIsLoadingViewer(false);
    } catch {
      setViewer(null);
      setIsLoadingViewer(false);
    }
  }, []);

  useEffect(() => {
    void loadViewer();
  }, [loadViewer, pathname]);

  useEffect(() => {
    const onFocus = () => {
      void loadViewer();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadViewer]);

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
    const response = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });

    if (!response.ok) {
      return;
    }

    setViewer(null);
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2" ref={navRef}>
      <Button asChild variant="ghost" className="font-semibold">
        <Link href="/mentors">Find a Mentor</Link>
      </Button>
      <Button asChild variant="ghost" className="font-semibold">
        <Link href="/faq">About</Link>
      </Button>
      <Button asChild className="bg-blue-600 font-semibold text-white hover:bg-blue-700">
        <Link href="/login">Sign In</Link>
      </Button>

      {navGroups.map((group) => {
        const isOpen = openKey === group.key;
        return (
          <div className="relative" key={group.key}>
            <Button
              type="button"
              variant="outline"
              aria-expanded={isOpen}
              onClick={() => setOpenKey(isOpen ? null : group.key)}
            >
              {group.title}
            </Button>
            {isOpen && (
              <div className="bg-background absolute right-0 z-20 mt-2 grid min-w-56 gap-1 rounded-xl border p-2 shadow-lg">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:bg-muted rounded-md px-3 py-2 text-sm"
                    onClick={() => setOpenKey(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-muted/40 ml-2 flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm" aria-live="polite">
        {!isLoadingViewer && !viewer && <span className="text-muted-foreground">Guest</span>}
        {isLoadingViewer && <span className="text-muted-foreground">Checking session...</span>}
        {viewer && (
          <>
            <span className="max-w-36 truncate">{viewer.name || viewer.email}</span>
            {viewer.role && <Badge variant="secondary">{viewer.role}</Badge>}
            <Button type="button" onClick={handleLogout} variant="secondary" size="sm">
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
