"use client";

import { useCallback, useEffect, useState } from "react";

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
    <div className="container">
      <h1>Admin Tutor Verification</h1>
      <p className="muted">Review pending tutor applications and approve or reject.</p>
      <p><strong>Status:</strong> {status}</p>

      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {submissions.map((submission) => (
          <section key={submission.id} className="card">
            <h3 style={{ marginTop: 0 }}>{submission.name}</h3>
            <p className="muted">{submission.university} · ${submission.hourlyRateUsd}/hr</p>
            <p>{submission.offeringSummary}</p>
            <h4>Profile photo</h4>
            <p className="muted">{submission.profilePhotoFileName}</p>
            <h4>Credential documents</h4>
            <ul>
              {submission.credentialDocuments.map((documentUrl) => (
                <li key={documentUrl}>{documentUrl}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn" onClick={() => decide(submission.id, "approve")}>Approve</button>
              <button type="button" className="btn" onClick={() => decide(submission.id, "reject")}>Reject</button>
            </div>
          </section>
        ))}
        {submissions.length === 0 && <section className="card">No pending tutor applications.</section>}
      </div>
    </div>
  );
}
