import { addDays } from "date-fns";
import type {
  Child,
  DemandSignal,
  GroupSession,
  Opportunity,
  Project,
  Proposal,
  User,
} from "@/lib/types";

const now = Date.now();

export const users: User[] = [
  {
    id: "f1",
    name: "Priya Sharma",
    role: "freelancer",
    university: "DY Patil College",
    skills: ["Arts & Crafts", "Design"],
    city: "Mumbai",
    hourlyRate: 300,
    rating: 4.8,
    studentIdVerified: true,
    bio: "I help children learn by building with their hands first, theory second.",
  },
  {
    id: "f2",
    name: "Arjun Mehta",
    role: "freelancer",
    university: "BITS Pilani",
    skills: ["Coding", "Science Projects", "Math"],
    city: "Remote",
    hourlyRate: 450,
    rating: 4.9,
    studentIdVerified: true,
    bio: "I break hard concepts into simple step-by-step mental models.",
  },
  {
    id: "f3",
    name: "Kavya Nair",
    role: "freelancer",
    university: "Christ University Bangalore",
    skills: ["Writing", "Language", "Arts"],
    city: "Bangalore",
    hourlyRate: 250,
    rating: 4.7,
    studentIdVerified: true,
    bio: "I turn confusion into clarity with examples from everyday life.",
  },
  { id: "p1", name: "Ramesh Kumar", role: "parent", city: "Mumbai" },
  { id: "p2", name: "Sunita Devi", role: "parent", city: "Bangalore" },
  {
    id: "s1",
    name: "Aditya Joshi",
    role: "university_student",
    city: "Pune",
    university: "Symbiosis Pune",
    course: "B.Com",
    year: 1,
  },
  {
    id: "s2",
    name: "Neha Rao",
    role: "university_student",
    city: "Hyderabad",
    university: "Osmania University",
    course: "B.Tech",
    year: 2,
  },
  {
    id: "s3",
    name: "Aarav Singh",
    role: "school_student",
    city: "Nagpur",
    course: "Class 9",
  },
];

export const children: Child[] = [
  {
    id: "c1",
    parentId: "p1",
    name: "Rohan",
    grade: "6",
    school: "Municipal High School",
    learningDNA: {
      attentionSpan: "short",
      explanationStyle: "hands_on",
      confusionTriggers: ["abstract numbers", "large jumps"],
      encouragementNeeds: "high",
      strongSubjects: ["science"],
      interestSignals: ["electronics", "robots"],
      lastUpdated: now,
    },
  },
  {
    id: "c2",
    parentId: "p2",
    name: "Priya",
    grade: "4",
    school: "Government Primary School",
  },
];

export const projects: Project[] = [
  {
    id: "pr1",
    requesterId: "p1",
    requesterType: "parent",
    childId: "c1",
    title: "Solar System Model — Grade 6 Science Fair",
    description:
      "Rohan needs help building a model he can explain himself in class. We have chart paper and thermocol.",
    subject: "Science",
    grade: "6",
    deadline: addDays(now, 3).getTime(),
    budgetMin: 300,
    budgetMax: 500,
    city: "Mumbai",
    isRemote: false,
    serviceMode: "guided_session",
    status: "open",
    suggestedFreelancerIds: ["f2", "f1"],
  },
  {
    id: "pr2",
    requesterId: "s1",
    requesterType: "university_student",
    title: "Understanding Debits and Credits — B.Com",
    description:
      "I want to understand the core logic of debit and credit with realistic examples.",
    subject: "Financial Accounting",
    deadline: addDays(now, 4).getTime(),
    budgetMin: 450,
    budgetMax: 650,
    isRemote: true,
    serviceMode: "guided_session",
    status: "open",
    suggestedFreelancerIds: ["f3", "f2"],
  },
  {
    id: "pr3",
    requesterId: "s3",
    requesterType: "school_student",
    title: "Fractions and Ratios — Class 9",
    description:
      "I want to understand fractions and ratio word problems step by step with visuals.",
    subject: "Math",
    grade: "9",
    deadline: addDays(now, 2).getTime(),
    budgetMin: 250,
    budgetMax: 400,
    isRemote: true,
    serviceMode: "guided_session",
    status: "open",
    suggestedFreelancerIds: ["f2", "f1"],
  },
];

export const proposals: Proposal[] = [
  {
    id: "pp1",
    projectId: "pr1",
    freelancerId: "f1",
    price: 420,
    approach:
      "We will build each planet with color coding, then rehearse a 2-minute explanation in simple words.",
    availability: "Today 7:30 PM",
    estimatedDuration: "90 mins",
    status: "pending",
    createdAt: now - 1000 * 60 * 18,
  },
  {
    id: "pp2",
    projectId: "pr1",
    freelancerId: "f2",
    price: 480,
    approach:
      "I use a hands-on build plus quick quiz checkpoints so the child can confidently explain the project.",
    availability: "Tomorrow 6:30 PM",
    estimatedDuration: "75 mins",
    status: "pending",
    createdAt: now - 1000 * 60 * 6,
  },
];

export const demandSignals: DemandSignal[] = [
  { topic: "Double-entry bookkeeping", subjectArea: "Financial Accounting", requestCount7d: 23, requestCount24h: 7, avgBudgetOffered: 350, trendDirection: "rising" },
  { topic: "Newton's Laws of Motion", subjectArea: "Physics", requestCount7d: 18, requestCount24h: 4, avgBudgetOffered: 300, trendDirection: "stable" },
  { topic: "Python list comprehensions", subjectArea: "Programming", requestCount7d: 31, requestCount24h: 11, avgBudgetOffered: 400, trendDirection: "rising" },
  { topic: "Essay structure and argumentation", subjectArea: "English", requestCount7d: 14, requestCount24h: 2, avgBudgetOffered: 250, trendDirection: "stable" },
  { topic: "Organic chemistry reaction mechanisms", subjectArea: "Chemistry", requestCount7d: 9, requestCount24h: 3, avgBudgetOffered: 450, trendDirection: "rising" },
  { topic: "DCF valuation basics", subjectArea: "Finance", requestCount7d: 19, requestCount24h: 6, avgBudgetOffered: 500, trendDirection: "rising" },
  { topic: "Sorting algorithms", subjectArea: "Data Structures", requestCount7d: 12, requestCount24h: 1, avgBudgetOffered: 380, trendDirection: "falling" },
  { topic: "Indian Constitution fundamentals", subjectArea: "Political Science", requestCount7d: 8, requestCount24h: 2, avgBudgetOffered: 280, trendDirection: "stable" },
];

export const groupSessions: GroupSession[] = [
  {
    id: "gs1",
    freelancerId: "f2",
    title: "Python List Comprehensions — From Confused to Confident",
    topic: "Python list comprehensions",
    subjectArea: "Programming",
    description:
      "After this class, you will write, read, and debug list comprehensions without guessing.",
    outline: [
      {
        segment: "Mental model first",
        durationMinutes: 20,
        whatYouWillUnderstand: "How a loop maps to comprehension syntax",
      },
      {
        segment: "Pattern drills",
        durationMinutes: 20,
        whatYouWillUnderstand: "When to use conditions inside comprehensions",
      },
      {
        segment: "Debug with confidence",
        durationMinutes: 20,
        whatYouWillUnderstand: "How to fix common mistakes in nested comprehensions",
      },
    ],
    aiAssisted: true,
    scheduledAt: addDays(now, 2).getTime(),
    durationMinutes: 60,
    maxSeats: 8,
    filledSeats: 3,
    pricePerSeat: 299,
    isRemote: true,
    status: "open",
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "o1",
    freelancerId: "f2",
    title: "Devfolio Campus Hackathon 2026",
    url: "https://devfolio.co",
    category: "hackathon",
    aiSummary:
      "You already teach coding fundamentals, so this hackathon can convert your teaching experience into a strong project portfolio story. It is highly aligned with your Python and DS mentorship profile.",
    deadline: "2026-04-12",
    prize: "₹1,50,000",
  },
  {
    id: "o2",
    freelancerId: "f2",
    title: "Paid Python Content Intern — Remote",
    url: "https://internshala.com",
    category: "internship",
    aiSummary:
      "This role rewards clear explanations for beginners, which matches your near-peer teaching style. It can also strengthen your earning continuity between live sessions.",
    deadline: "2026-04-08",
  },
  {
    id: "o3",
    freelancerId: "f2",
    title: "Student Freelance Coding Support Requests",
    url: "https://www.fiverr.com",
    category: "gig",
    aiSummary:
      "These gigs overlap with your current tutoring strengths and can be delivered in flexible evening slots. Good fit for your existing workflow and hourly target.",
  },
];

export const reportSeed = {
  what_we_covered:
    "Rohan built the inner planets model himself and practiced a clear explanation for orbital order.",
  what_your_child_found_hard:
    "Remembering the sequence after Earth and scaling planet sizes.",
  what_to_reinforce_at_home:
    "Ask Rohan to explain one planet each night in 60 seconds without reading notes.",
  materials_to_buy_for_next_time: ["Black chart paper", "Glue gun sticks", "Blue acrylic paint"],
  freelancer_observation:
    "Rohan learns fastest when he can touch and assemble pieces before discussing theory.",
};
