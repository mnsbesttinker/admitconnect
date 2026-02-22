import { mentors, type Mentor } from "@/lib/mentors";

export type Review = {
  id: string;
  mentorId: string;
  applicantName: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type AvailabilitySlot = {
  id: string;
  mentorId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  isBooked: boolean;
};

export type MentorOnboardingRequest = {
  name: string;
  university: string;
  graduationYear: number;
  major: string;
  bio: string;
  languages: string[];
  credibilityTags: string[];
};

const reviews: Review[] = [
  {
    id: "r1",
    mentorId: "nora-mit",
    applicantName: "A. Khan",
    rating: 5,
    text: "Super clear strategy and realistic school list advice.",
    createdAt: new Date().toISOString()
  },
  {
    id: "r2",
    mentorId: "david-duke",
    applicantName: "N. Sharma",
    rating: 5,
    text: "Great essay framing feedback in one call.",
    createdAt: new Date().toISOString()
  }
];

const availabilitySlots: AvailabilitySlot[] = [
  {
    id: "s1",
    mentorId: "nora-mit",
    startTimeUtc: "2026-03-01T15:00:00.000Z",
    endTimeUtc: "2026-03-01T15:45:00.000Z",
    isBooked: false
  },
  {
    id: "s2",
    mentorId: "nora-mit",
    startTimeUtc: "2026-03-02T17:00:00.000Z",
    endTimeUtc: "2026-03-02T18:30:00.000Z",
    isBooked: false
  },
  {
    id: "s3",
    mentorId: "sam-columbia",
    startTimeUtc: "2026-03-03T13:00:00.000Z",
    endTimeUtc: "2026-03-03T13:15:00.000Z",
    isBooked: false
  }
];

const pendingOnboarding: Array<MentorOnboardingRequest & { id: string; verificationStatus: "pending" }> = [];

export function listMentors(filters: { major?: string; language?: string; tag?: string; query?: string }): Mentor[] {
  return mentors.filter((mentor) => {
    const majorMatch = !filters.major || mentor.major.toLowerCase().includes(filters.major.toLowerCase());
    const languageMatch = !filters.language || mentor.languages.some((language) => language.toLowerCase() === filters.language?.toLowerCase());
    const tagMatch = !filters.tag || mentor.credibilityTags.some((tag) => tag.toLowerCase() === filters.tag?.toLowerCase());
    const queryMatch =
      !filters.query ||
      [mentor.name, mentor.university, mentor.major, mentor.bio]
        .join(" ")
        .toLowerCase()
        .includes(filters.query.toLowerCase());

    return majorMatch && languageMatch && tagMatch && queryMatch;
  });
}

export function getMentor(id: string): Mentor | undefined {
  return mentors.find((mentor) => mentor.id === id);
}

export function listReviewsForMentor(mentorId: string): Review[] {
  return reviews.filter((review) => review.mentorId === mentorId);
}

export function createReview(input: Omit<Review, "id" | "createdAt">): Review {
  const review: Review = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input
  };

  reviews.push(review);
  return review;
}

export function listAvailabilityForMentor(mentorId: string): AvailabilitySlot[] {
  return availabilitySlots.filter((slot) => slot.mentorId === mentorId);
}

export function submitMentorOnboarding(payload: MentorOnboardingRequest) {
  const record = {
    id: crypto.randomUUID(),
    verificationStatus: "pending" as const,
    ...payload
  };

  pendingOnboarding.push(record);
  return record;
}
