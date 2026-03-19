"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_TIMEZONES } from "@/lib/timezones";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles = ["student", "tutor"] as const;
type Role = (typeof roles)[number];

async function postJsonWithTimeout(url: string, body: unknown, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      credentials: "include",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default function SignupPage() {
  const router = useRouter();
  const timezoneGuess = useMemo(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    return SUPPORTED_TIMEZONES.includes(detected as (typeof SUPPORTED_TIMEZONES)[number]) ? detected : "America/Anchorage";
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [timezone, setTimezone] = useState(timezoneGuess);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let signupRes: Response;
    try {
      signupRes = await postJsonWithTimeout("/api/auth/signup", { name, email, password, role, timezone });
    } catch {
      setError("Signup request timed out. Check your database deployment/config and try again.");
      setIsSubmitting(false);
      return;
    }

    if (!signupRes.ok) {
      const payload = (await signupRes.json()) as { error?: string };
      setError(payload.error || "Sign-up failed");
      setIsSubmitting(false);
      return;
    }

    let loginRes: Response;
    try {
      loginRes = await postJsonWithTimeout("/api/auth/login", { email, password });
    } catch {
      setError("Auto-login request timed out. Please try logging in manually.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);

    if (!loginRes.ok) {
      setError("Account created but auto-login failed. Please login manually.");
      router.push("/login");
      return;
    }

    router.refresh();
    router.push(role === "tutor" ? "/tutor/onboarding" : "/student/onboarding");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join AdmitConnect and set up your mentorship profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roles.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                required
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {SUPPORTED_TIMEZONES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Sign up"}
            </Button>

            {error && <p className="text-sm text-red-700">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
