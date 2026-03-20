"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AppRole } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

type NavItem = { href: Route; label: string };
type Viewer = { name: string | null; email?: string | null; role: AppRole | null } | null;

const resourcesItems: NavItem[] = [
  { href: "/faq", label: "How it works" },
  { href: "/trust-safety", label: "Trust & Safety" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refund policy" }
];

const studentItems: NavItem[] = [
  { href: "/student/onboarding", label: "Student onboarding" },
  { href: "/messages/student", label: "Student messages" },
  { href: "/book", label: "Bookings" }
];

const tutorItems: NavItem[] = [
  { href: "/messages/tutor", label: "Tutor messages" },
  { href: "/tutor/availability", label: "Tutor availability" },
  { href: "/book", label: "Bookings" },
  { href: "/tutor/onboarding", label: "Tutor onboarding" }
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [isLoadingViewer, setIsLoadingViewer] = useState(true);
  const navRef = useRef<HTMLElement | null>(null);

  const roleItems = useMemo(() => {
    if (!viewer?.role) return [];
    return viewer.role === "student" ? studentItems : tutorItems;
  }, [viewer?.role]);

  const profileLabel = viewer?.name || viewer?.email || "Profile";

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
    setIsMobileMenuOpen(false);
    setOpenKey(null);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

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
    setOpenKey(null);
  }

  return (
    <nav className="relative flex items-center justify-end gap-2" ref={navRef}>
      <Button
        type="button"
        variant="outline"
        className="md:hidden"
        aria-expanded={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen((value) => !value)}
      >
        {isMobileMenuOpen ? "Close" : "Menu"}
      </Button>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            aria-label="Close menu backdrop"
            className="absolute inset-0 bg-black/35"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setOpenKey(null);
            }}
          />
          <div className="bg-background absolute inset-y-0 right-0 flex w-[82vw] max-w-sm min-w-0 flex-col border-l shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Menu</p>
              <Button type="button" variant="ghost" className="h-9 px-3" onClick={() => setIsMobileMenuOpen(false)}>
                Close
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden p-4">
              <div className="grid gap-1">
                <Link
                  href="/"
                  className="hover:bg-muted w-full min-w-0 rounded-md px-3 py-3 text-sm font-semibold"
                  onClick={() => setOpenKey(null)}
                >
                  Home
                </Link>
                <Link
                  href="/mentors"
                  className="hover:bg-muted w-full min-w-0 rounded-md px-3 py-3 text-sm font-semibold"
                  onClick={() => setOpenKey(null)}
                >
                  Find a Mentor
                </Link>
                <Link
                  href="/faq"
                  className="hover:bg-muted w-full min-w-0 rounded-md px-3 py-3 text-sm font-semibold"
                  onClick={() => setOpenKey(null)}
                >
                  About
                </Link>
              </div>

              <div className="grid gap-2 border-t pt-4">
                <button
                  type="button"
                  className="hover:bg-muted flex h-11 w-full min-w-0 items-center justify-between rounded-md border px-3 text-left text-sm font-medium"
                  aria-expanded={openKey === "resources-mobile"}
                  onClick={() => setOpenKey(openKey === "resources-mobile" ? null : "resources-mobile")}
                >
                  <span>Resources</span>
                </button>
                {openKey === "resources-mobile" && (
                  <div className="grid gap-1">
                    {resourcesItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="hover:bg-muted w-full min-w-0 rounded-md px-3 py-2 text-sm"
                        onClick={() => setOpenKey(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {isLoadingViewer ? (
                <span className="text-muted-foreground px-2 text-sm">Checking session...</span>
              ) : !viewer ? (
                <Button asChild className="h-11 w-full bg-blue-600 font-semibold text-white hover:bg-blue-700">
                  <Link href="/login">Sign In</Link>
                </Button>
              ) : (
                <div className="grid gap-2 border-t pt-4">
                  <button
                    type="button"
                    className="hover:bg-muted flex h-11 w-full min-w-0 items-center justify-between rounded-md border px-3 text-left text-sm font-medium"
                    aria-expanded={openKey === "profile-mobile"}
                    onClick={() => setOpenKey(openKey === "profile-mobile" ? null : "profile-mobile")}
                  >
                    <span className="min-w-0 truncate">{profileLabel}</span>
                  </button>
                  {openKey === "profile-mobile" && (
                    <div className="grid gap-1">
                      {roleItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="hover:bg-muted w-full min-w-0 rounded-md px-3 py-2 text-sm"
                          onClick={() => setOpenKey(null)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="hover:bg-muted w-full min-w-0 rounded-md px-3 py-2 text-left text-sm font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="hidden flex-wrap items-center justify-end gap-2 md:flex">
        <Button asChild variant="ghost" className="font-semibold">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="ghost" className="font-semibold">
          <Link href="/mentors">Find a Mentor</Link>
        </Button>
        <Button asChild variant="ghost" className="font-semibold">
          <Link href="/faq">About</Link>
        </Button>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            aria-expanded={openKey === "resources"}
            onClick={() => setOpenKey(openKey === "resources" ? null : "resources")}
          >
            Resources
          </Button>
          {openKey === "resources" && (
            <div className="bg-background absolute right-0 z-20 mt-2 grid min-w-56 gap-1 rounded-xl border p-2 shadow-lg">
              {resourcesItems.map((item) => (
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

        {isLoadingViewer ? (
          <span className="text-muted-foreground px-2 text-sm">Checking session...</span>
        ) : !viewer ? (
          <Button asChild className="bg-blue-600 font-semibold text-white hover:bg-blue-700">
            <Link href="/login">Sign In</Link>
          </Button>
        ) : (
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="max-w-52"
              aria-expanded={openKey === "profile"}
              onClick={() => setOpenKey(openKey === "profile" ? null : "profile")}
            >
              <span className="truncate">{profileLabel}</span>
            </Button>
            {openKey === "profile" && (
              <div className="bg-background absolute right-0 z-20 mt-2 grid min-w-60 gap-1 rounded-xl border p-2 shadow-lg">
                {roleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:bg-muted rounded-md px-3 py-2 text-sm"
                    onClick={() => setOpenKey(null)}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hover:bg-muted rounded-md px-3 py-2 text-left text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
