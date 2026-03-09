export type SessionOffering = {
  id: "quick-fix" | "deep-dive" | "full-review";
  name: string;
  minutes: number;
  priceUsd: number;
};

export type Mentor = {
  id: string;
  name: string;
  university: string;
  major: string;
  graduationYear: number;
  languages: string[];
  credibilityTags: string[];
  timezone: string;
  scholarshipType: string;
  bio: string;
  rating: number;
  reviewCount: number;
  sessionTypes: SessionOffering[];
};

export const sessionTypes: SessionOffering[] = [
  { id: "quick-fix", name: "15 min Quick Fix", minutes: 15, priceUsd: 20 },
  { id: "deep-dive", name: "45 min Deep Dive", minutes: 45, priceUsd: 55 },
  { id: "full-review", name: "90 min Full Review", minutes: 90, priceUsd: 100 }
];

export const mentors: Mentor[] = [
  {
    id: "nora-mit",
    name: "Nora Rahman",
    university: "MIT",
    major: "Computer Science",
    graduationYear: 2026,
    languages: ["English", "Bangla"],
    credibilityTags: ["full-ride", "need-based", "STEM"],
    timezone: "America/New_York",
    scholarshipType: "Need-based aid",
    bio: "I help students build a realistic school list and position financial context clearly in essays and additional info sections.",
    rating: 4.9,
    reviewCount: 34,
    sessionTypes,
  },
  {
    id: "david-duke",
    name: "David Kim",
    university: "Duke University",
    major: "Public Policy",
    graduationYear: 2025,
    languages: ["English", "Korean"],
    credibilityTags: ["merit", "essay-strategy", "T20"],
    timezone: "America/Chicago",
    scholarshipType: "Merit scholarship",
    bio: "I focus on positioning leadership and impact for scholarship committees and can pressure-test personal statement narratives.",
    rating: 4.8,
    reviewCount: 21,
    sessionTypes,
  },
  {
    id: "sam-columbia",
    name: "Samira Chowdhury",
    university: "Columbia University",
    major: "Economics",
    graduationYear: 2027,
    languages: ["English", "Hindi", "Urdu"],
    credibilityTags: ["need-based", "first-gen", "interview-prep"],
    timezone: "America/New_York",
    scholarshipType: "Need-based + external scholarships",
    bio: "I help international first-gen applicants break the process into a weekly plan and prep for counselor/interviewer conversations.",
    rating: 5,
    reviewCount: 11,
    sessionTypes,
  }
];

export function getMentorById(id: string) {
  return mentors.find((mentor) => mentor.id === id);
}
