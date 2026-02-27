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

const adminHeaders = { "x-user-role": "admin", "x-user-name": "Platform Admin" };

export default function AdminVerificationPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [status, setStatus] = useState("Loading...");

  const loadPending = useCallback(async function loadPending() {
    const response = await fetch("/api/admin/mentors/pending", { headers: adminHeaders });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Failed to load pending submissions");
      return;
    }

    setSubmissions(data.data);
    setStatus(`Loaded ${data.count} pending submissions`);
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  async function decide(id: string, action: "approve" | "reject") {
    const response = await fetch(`/api/admin/mentors/${id}/${action}`, {
      headers: { ...adminHeaders, "Content-Type": "application/json" },
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
