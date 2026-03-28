export type Role = "parent" | "school_student" | "university_student" | "freelancer";

export type LearningDNA = {
  attentionSpan: "short" | "medium" | "long";
  explanationStyle: "visual" | "verbal" | "hands_on" | "mixed";
  confusionTriggers: string[];
  encouragementNeeds: "high" | "medium" | "low";
  strongSubjects: string[];
  interestSignals: string[];
  lastUpdated: number;
};

export type User = {
  id: string;
  name: string;
  role: Role;
  city?: string;
  educationStage?: "middle_school" | "high_school" | "university";
  helpTypes?: string[];
  preferredLearningMode?: "virtual" | "in_person" | "either";
  university?: string;
  course?: string;
  year?: number;
  skills?: string[];
  rating?: number;
  hourlyRate?: number;
  studentIdVerified?: boolean;
  bio?: string;
};

export type Child = {
  id: string;
  parentId: string;
  name: string;
  grade: string;
  school?: string;
  learningDNA?: LearningDNA;
};

export type Project = {
  id: string;
  requesterId: string;
  requesterType: "parent" | "school_student" | "university_student";
  childId?: string;
  title: string;
  description: string;
  subject: string;
  grade?: string;
  deadline: number;
  budgetMin: number;
  budgetMax: number;
  city?: string;
  isRemote: boolean;
  serviceMode: "guided_session" | "accompanied_build" | "full_build";
  status: "open" | "in_progress" | "completed";
  suggestedFreelancerIds?: string[];
};

export type Proposal = {
  id: string;
  projectId: string;
  freelancerId: string;
  price: number;
  approach: string;
  availability: string;
  estimatedDuration: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
};

export type DemandSignal = {
  topic: string;
  subjectArea: string;
  requestCount7d: number;
  requestCount24h: number;
  avgBudgetOffered: number;
  trendDirection: "rising" | "stable" | "falling";
};

export type GroupSession = {
  id: string;
  freelancerId: string;
  title: string;
  topic: string;
  subjectArea: string;
  description: string;
  outline: Array<{ segment: string; durationMinutes: number; whatYouWillUnderstand: string }>;
  aiAssisted: boolean;
  scheduledAt: number;
  durationMinutes: number;
  maxSeats: number;
  filledSeats: number;
  pricePerSeat: number;
  isRemote: boolean;
  status: "open" | "full" | "completed";
};

export type Opportunity = {
  id: string;
  freelancerId: string;
  title: string;
  url: string;
  category: "gig" | "internship" | "hackathon" | "scholarship" | "competition" | "volunteer";
  aiSummary: string;
  deadline?: string;
  prize?: string;
};
