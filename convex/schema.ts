import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    role: v.union(
      v.literal("parent"),
      v.literal("school_student"),
      v.literal("university_student"),
      v.literal("freelancer")
    ),
    city: v.optional(v.string()),
    educationStage: v.optional(
      v.union(v.literal("middle_school"), v.literal("high_school"), v.literal("university"))
    ),
    helpTypes: v.optional(v.array(v.string())),
    preferredLearningMode: v.optional(
      v.union(v.literal("virtual"), v.literal("in_person"), v.literal("either"))
    ),
    university: v.optional(v.string()),
    course: v.optional(v.string()),
    year: v.optional(v.number()),
    studentIdVerified: v.optional(v.boolean()),
    studentIdStorageId: v.optional(v.id("_storage")),
    skills: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    rating: v.optional(v.number()),
    ratingCount: v.optional(v.number()),
    portfolioItems: v.optional(
      v.array(
        v.object({
          title: v.string(),
          imageStorageId: v.optional(v.id("_storage")),
          description: v.string(),
        })
      )
    ),
    profileEmbedding: v.optional(v.array(v.float64())),
    walletBalance: v.optional(v.number()),
    totalEarned: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  children: defineTable({
    parentId: v.id("users"),
    name: v.string(),
    school: v.optional(v.string()),
    grade: v.optional(v.string()),
    learningDNAId: v.optional(v.id("learningDNA")),
    createdAt: v.number(),
  }).index("by_parent", ["parentId"]),

  learningDNA: defineTable({
    childId: v.id("children"),
    attentionSpan: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
    explanationStyle: v.union(
      v.literal("visual"),
      v.literal("verbal"),
      v.literal("hands_on"),
      v.literal("mixed")
    ),
    confusionTriggers: v.array(v.string()),
    encouragementNeeds: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    strongSubjects: v.array(v.string()),
    interestSignals: v.array(v.string()),
    rawSessionNotes: v.array(v.string()),
    focusTopics: v.optional(v.array(v.string())),
    lastUpdated: v.number(),
  }).index("by_child", ["childId"]),

  projects: defineTable({
    requesterId: v.id("users"),
    requesterType: v.union(v.literal("parent"), v.literal("school_student"), v.literal("university_student")),
    childId: v.optional(v.id("children")),

    title: v.string(),
    description: v.string(),
    subject: v.string(),
    grade: v.optional(v.string()),
    deadline: v.number(),
    budgetMin: v.number(),
    budgetMax: v.number(),
    city: v.optional(v.string()),
    isRemote: v.boolean(),

    serviceMode: v.union(
      v.literal("guided_session"),
      v.literal("accompanied_build"),
      v.literal("full_build")
    ),

    briefImageStorageId: v.optional(v.id("_storage")),
    aiExtractedData: v.optional(
      v.object({
        extractedTitle: v.optional(v.string()),
        extractedDeadline: v.optional(v.string()),
        materials: v.array(v.string()),
        confidence: v.number(),
      })
    ),

    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),

    acceptedProposalId: v.optional(v.id("proposals")),
    acceptedFreelancerId: v.optional(v.id("users")),

    embedding: v.optional(v.array(v.float64())),
    suggestedFreelancerIds: v.optional(v.array(v.id("users"))),

    proofOfLearningPassed: v.optional(v.boolean()),
    sessionReportId: v.optional(v.id("sessionReports")),

    createdAt: v.number(),
  })
    .index("by_requester", ["requesterId"])
    .index("by_status", ["status"])
    .index("by_freelancer", ["acceptedFreelancerId"]),

  proposals: defineTable({
    projectId: v.id("projects"),
    freelancerId: v.id("users"),
    price: v.number(),
    approach: v.string(),
    availability: v.string(),
    estimatedDuration: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("withdrawn")
    ),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_freelancer", ["freelancerId"])
    .index("by_project_and_freelancer", ["projectId", "freelancerId"]),

  sessions: defineTable({
    projectId: v.id("projects"),
    freelancerId: v.id("users"),
    requesterId: v.id("users"),

    scheduledAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),

    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rated")
    ),

    sessionType: v.union(v.literal("virtual"), v.literal("in_person")),
    meetingLink: v.optional(v.string()),

    copilotConsentGiven: v.boolean(),
    sessionTranscriptChunks: v.array(v.string()),
    lastCopilotSuggestion: v.optional(v.string()),
    lastCopilotTimestamp: v.optional(v.number()),

    freelancerNotes: v.optional(v.string()),
    proofOfLearningQuestions: v.optional(
      v.array(
        v.object({
          question: v.string(),
          options: v.array(v.string()),
          correctIndex: v.number(),
        })
      )
    ),
    proofOfLearningScore: v.optional(v.number()),
    proofOfLearningPassed: v.optional(v.boolean()),
    sessionReportGenerated: v.optional(v.boolean()),

    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_freelancer", ["freelancerId"])
    .index("by_requester", ["requesterId"])
    .index("by_status", ["status"]),

  crashCourseRequests: defineTable({
    requesterId: v.id("users"),
    topic: v.string(),
    subjectArea: v.string(),
    description: v.string(),
    estimatedDepth: v.union(
      v.literal("introductory"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    preferredFormat: v.union(v.literal("one_on_one"), v.literal("group_class"), v.literal("either")),
    budgetPerSession: v.number(),
    deadline: v.optional(v.number()),
    isRemote: v.boolean(),
    intentClassification: v.optional(
      v.object({
        intent: v.string(),
        isTooAssignmentSpecific: v.boolean(),
        confidence: v.number(),
      })
    ),
    status: v.union(v.literal("open"), v.literal("matched"), v.literal("completed"), v.literal("cancelled")),
    matchedGroupSessionId: v.optional(v.id("groupSessions")),
    createdAt: v.number(),
  })
    .index("by_requester", ["requesterId"])
    .index("by_topic", ["topic"])
    .index("by_status", ["status"]),

  groupSessions: defineTable({
    freelancerId: v.id("users"),
    title: v.string(),
    topic: v.string(),
    subjectArea: v.string(),
    description: v.string(),
    outline: v.array(
      v.object({
        segment: v.string(),
        durationMinutes: v.number(),
        whatYouWillUnderstand: v.string(),
      })
    ),
    aiAssisted: v.boolean(),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    maxSeats: v.number(),
    filledSeats: v.number(),
    pricePerSeat: v.number(),
    isRemote: v.boolean(),
    meetingLink: v.optional(v.string()),
    city: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("full"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    demandSignalScore: v.optional(v.number()),
    proofOfLearningEnabled: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_freelancer", ["freelancerId"])
    .index("by_topic", ["topic"])
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledAt"]),

  enrollments: defineTable({
    groupSessionId: v.id("groupSessions"),
    studentId: v.id("users"),
    paymentStatus: v.union(v.literal("pending"), v.literal("paid"), v.literal("refunded")),
    attended: v.optional(v.boolean()),
    proofOfLearningScore: v.optional(v.number()),
    proofOfLearningPassed: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_session", ["groupSessionId"])
    .index("by_student", ["studentId"]),

  demandSignals: defineTable({
    topic: v.string(),
    subjectArea: v.string(),
    requestCount7d: v.number(),
    requestCount24h: v.number(),
    avgBudgetOffered: v.number(),
    topCities: v.array(v.string()),
    isRemotePreferred: v.boolean(),
    trendDirection: v.union(v.literal("rising"), v.literal("stable"), v.literal("falling")),
    lastUpdated: v.number(),
  })
    .index("by_topic", ["topic"])
    .index("by_request_count", ["requestCount7d"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    projectId: v.optional(v.id("projects")),
    lastMessageAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("system"), v.literal("file")),
    fileStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  sessionReports: defineTable({
    sessionId: v.id("sessions"),
    projectId: v.id("projects"),
    parentId: v.id("users"),
    childId: v.optional(v.id("children")),
    whatWeCovered: v.string(),
    whatChildFoundHard: v.string(),
    whatToReinforceAtHome: v.string(),
    materialsToBuy: v.array(v.string()),
    freelancerObservation: v.string(),
    interestSignalsDetected: v.array(v.string()),
    emailSent: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_parent", ["parentId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("new_proposal"),
      v.literal("proposal_accepted"),
      v.literal("session_starting"),
      v.literal("proof_of_learning_ready"),
      v.literal("report_ready"),
      v.literal("payment_received"),
      v.literal("new_opportunity"),
      v.literal("mentor_chain_match"),
      v.literal("crash_course_match"),
      v.literal("high_demand_alert"),
      v.literal("group_session_seat_taken"),
      v.literal("group_session_almost_full")
    ),
    title: v.string(),
    body: v.string(),
    linkPath: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),

  payments: defineTable({
    projectId: v.id("projects"),
    payerId: v.id("users"),
    payeeId: v.id("users"),
    amount: v.number(),
    platformFee: v.number(),
    netAmount: v.number(),
    status: v.union(v.literal("held"), v.literal("released"), v.literal("disputed"), v.literal("refunded")),
    razorpayOrderId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_payee", ["payeeId"]),

  pricingBenchmarks: defineTable({
    category: v.string(),
    city: v.string(),
    minRate: v.number(),
    maxRate: v.number(),
    medianRate: v.number(),
    sampleSize: v.number(),
    source: v.array(v.string()),
    scrapedAt: v.number(),
  }).index("by_category_city", ["category", "city"]),

  opportunities: defineTable({
    freelancerId: v.id("users"),
    title: v.string(),
    url: v.string(),
    description: v.string(),
    aiSummary: v.string(),
    category: v.union(
      v.literal("gig"),
      v.literal("internship"),
      v.literal("hackathon"),
      v.literal("scholarship"),
      v.literal("competition"),
      v.literal("volunteer")
    ),
    deadline: v.optional(v.string()),
    prize: v.optional(v.string()),
    relevanceScore: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_freelancer", ["freelancerId"])
    .index("by_freelancer_expires", ["freelancerId", "expiresAt"]),

  ratings: defineTable({
    sessionId: v.id("sessions"),
    raterId: v.id("users"),
    ratedId: v.id("users"),
    score: v.number(),
    review: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_rated", ["ratedId"]),

  mentorChains: defineTable({
    freelancerId: v.id("users"),
    childId: v.id("children"),
    sessionCount: v.number(),
    firstSessionAt: v.number(),
    lastSessionAt: v.number(),
    bondStrength: v.union(v.literal("forming"), v.literal("established"), v.literal("deep")),
  })
    .index("by_freelancer", ["freelancerId"])
    .index("by_child", ["childId"]),

  classPools: defineTable({
    projectId: v.id("projects"),
    initiatorChildId: v.id("children"),
    participantChildIds: v.array(v.id("children")),
    splitAmounts: v.array(
      v.object({
        childId: v.id("children"),
        parentId: v.id("users"),
        amount: v.number(),
        paid: v.boolean(),
      })
    ),
    status: v.union(v.literal("forming"), v.literal("locked"), v.literal("completed")),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),
});
