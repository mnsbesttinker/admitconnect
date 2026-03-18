"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Submission = {
  id: string;
  name: string;
  university: string;
  hourlyRateUsd: number;
  offeringSummary: string;
  profilePhotoFileName: string;
  credentialDocuments: string[];
};

export default function AdminVerificationPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [status, setStatus] = useState("Loading...");
  const [canManage, setCanManage] = useState(false);

  const loadPending = useCallback(async function loadPending() {
    const authResponse = await fetch("/api/auth/me", { cache: "no-store" });
    if (!authResponse.ok) {
      setSubmissions([]);
      setCanManage(false);
      setStatus("Please login as an admin to review submissions.");
      return;
    }

    const authPayload = (await authResponse.json()) as { data: { role: string | null } };
    if (authPayload.data.role !== "admin") {
      setSubmissions([]);
      setCanManage(false);
      setStatus("Admin role required to review submissions.");
      return;
    }

    const response = await fetch("/api/admin/mentors/pending");
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Failed to load pending submissions");
      return;
    }

    setCanManage(true);
    setSubmissions(data.data);
    setStatus(`Loaded ${data.count} pending submissions`);
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  async function decide(id: string, action: "approve" | "reject") {
    if (!canManage) {
      setStatus("Admin role required to review submissions.");
      return;
    }
    const response = await fetch(`/api/admin/mentors/${id}/${action}`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ adminNotes: action === "approve" ? "Approved" : "Rejected" })
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Decision failed");
      return;
    }

    setStatus(`Submission ${id} ${action}d`);
    await loadPending();
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Admin Tutor Verification</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <p className="text-muted-foreground text-sm">Review pending tutor applications and approve or reject.</p>
          <p className="text-sm">
            <span className="font-semibold">Status:</span> {status}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="bg-white">
            <CardHeader>
              <CardTitle>{submission.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-muted-foreground text-sm">
                {submission.university} · ${submission.hourlyRateUsd}/hr
              </p>
              <p className="text-sm">{submission.offeringSummary}</p>

              <div className="grid gap-1 text-sm">
                <p className="font-semibold">Profile photo</p>
                <p className="text-muted-foreground">{submission.profilePhotoFileName}</p>
              </div>

              <div className="grid gap-1 text-sm">
                <p className="font-semibold">Credential documents</p>
                <ul className="list-inside list-disc text-muted-foreground">
                  {submission.credentialDocuments.map((documentUrl) => (
                    <li key={documentUrl}>{documentUrl}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => decide(submission.id, "approve")}>Approve</Button>
                <Button type="button" variant="secondary" onClick={() => decide(submission.id, "reject")}>Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {submissions.length === 0 && <Card className="bg-white"><CardContent className="py-6 text-sm">No pending tutor applications.</CardContent></Card>}
      </div>
    </div>
  );
}
