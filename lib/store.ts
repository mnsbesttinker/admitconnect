import { mentors, sessionTypes, type Mentor } from "@/lib/mentors";

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
  hourlyRateUsd: number;
  offeringSummary: string;
  profilePhotoFileName: string;
  credentialDocuments: string[];
};

export type MentorOnboardingSubmission = MentorOnboardingRequest & {
  id: string;
  verificationStatus: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: string;
};

export type BookingStatus = "pending" | "paid" | "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  applicantName: string;
  mentorId: string;
  sessionTypeId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  status: BookingStatus;
  meetingLink: string | null;
  createdAt: string;
};

export type PaymentStatus = "requires_payment" | "paid" | "failed";

export type PaymentRecord = {
  id: string;
  bookingId: string;
  providerPaymentIntentId: string;
  amountTotal: number;
  platformFeeAmount: number;
  mentorPayoutAmount: number;
  status: PaymentStatus;
  createdAt: string;
};

const PLATFORM_COMMISSION_PCT = 0.05;

type InMemoryState = {
  reviews: Review[];
  availabilitySlots: AvailabilitySlot[];
  onboardingSubmissions: MentorOnboardingSubmission[];
  bookings: Booking[];
  payments: PaymentRecord[];
};

const globalStore = globalThis as typeof globalThis & { __admitConnectStore?: InMemoryState };

const defaultState: InMemoryState = {
  reviews: [
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
] ,
  availabilitySlots: [
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
  },
  {
    id: "s4",
    mentorId: "david-duke",
    startTimeUtc: "2026-03-04T19:00:00.000Z",
    endTimeUtc: "2026-03-04T19:45:00.000Z",
    isBooked: false
  }
] ,
  onboardingSubmissions: [],
  bookings: [],
  payments: []
};

if (!globalStore.__admitConnectStore) {
  globalStore.__admitConnectStore = defaultState;
}

const { reviews, availabilitySlots, onboardingSubmissions, bookings, payments } = globalStore.__admitConnectStore;

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

export function submitMentorOnboarding(payload: MentorOnboardingRequest): MentorOnboardingSubmission {
  const record: MentorOnboardingSubmission = {
    id: crypto.randomUUID(),
    verificationStatus: "pending",
    createdAt: new Date().toISOString(),
    ...payload
  };

  onboardingSubmissions.push(record);
  return record;
}

export function listPendingOnboarding() {
  return onboardingSubmissions.filter((submission) => submission.verificationStatus === "pending");
}

export function decideOnboarding(id: string, decision: "approved" | "rejected", adminNotes?: string) {
  const record = onboardingSubmissions.find((submission) => submission.id === id);
  if (!record) {
    return null;
  }

  record.verificationStatus = decision;
  record.adminNotes = adminNotes;
  return record;
}

export function createBooking(input: {
  applicantName: string;
  mentorId: string;
  sessionTypeId: string;
  startTimeUtc: string;
}): Booking | null {
  const mentor = getMentor(input.mentorId);
  const sessionType = sessionTypes.find((session) => session.id === input.sessionTypeId);

  if (!mentor || !sessionType) {
    return null;
  }

  const slot = availabilitySlots.find(
    (s) => s.mentorId === input.mentorId && s.startTimeUtc === input.startTimeUtc && !s.isBooked
  );

  if (!slot) {
    return null;
  }

  slot.isBooked = true;

  const booking: Booking = {
    id: crypto.randomUUID(),
    applicantName: input.applicantName,
    mentorId: input.mentorId,
    sessionTypeId: input.sessionTypeId,
    startTimeUtc: slot.startTimeUtc,
    endTimeUtc: slot.endTimeUtc,
    status: "pending",
    meetingLink: null,
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  return booking;
}

export function listBookingsByApplicant(applicantName: string) {
  return bookings.filter((booking) => booking.applicantName.toLowerCase() === applicantName.toLowerCase());
}

export function listBookingsByMentor(mentorId: string) {
  return bookings.filter((booking) => booking.mentorId === mentorId);
}

export function cancelBooking(id: string) {
  const booking = bookings.find((entry) => entry.id === id);
  if (!booking) {
    return null;
  }

  booking.status = "cancelled";
  const slot = availabilitySlots.find(
    (entry) => entry.mentorId === booking.mentorId && entry.startTimeUtc === booking.startTimeUtc
  );
  if (slot) {
    slot.isBooked = false;
  }

  return booking;
}

export function completeBooking(id: string) {
  const booking = bookings.find((entry) => entry.id === id);
  if (!booking) {
    return null;
  }

  booking.status = "completed";
  return booking;
}

export function createPaymentIntent(bookingId: string) {
  const booking = bookings.find((entry) => entry.id === bookingId);
  if (!booking) {
    return null;
  }

  const sessionType = sessionTypes.find((session) => session.id === booking.sessionTypeId);
  if (!sessionType) {
    return null;
  }

  const amountTotal = sessionType.priceUsd;
  const platformFeeAmount = Math.round(amountTotal * PLATFORM_COMMISSION_PCT);
  const mentorPayoutAmount = amountTotal - platformFeeAmount;

  const payment: PaymentRecord = {
    id: crypto.randomUUID(),
    bookingId,
    providerPaymentIntentId: `pi_${crypto.randomUUID().replaceAll("-", "")}`,
    amountTotal,
    platformFeeAmount,
    mentorPayoutAmount,
    status: "requires_payment",
    createdAt: new Date().toISOString()
  };

  payments.push(payment);
  return payment;
}

export function markPaymentPaid(providerPaymentIntentId: string) {
  const payment = payments.find((entry) => entry.providerPaymentIntentId === providerPaymentIntentId);
  if (!payment) {
    return null;
  }

  payment.status = "paid";
  const booking = bookings.find((entry) => entry.id === payment.bookingId);
  if (booking) {
    booking.status = "confirmed";
    booking.meetingLink = `https://meet.google.com/${booking.id.slice(0, 3)}-${booking.id.slice(3, 6)}-${booking.id.slice(6, 9)}`;
  }

  return { payment, booking };
}
