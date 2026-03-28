import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getAuthedUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  return { identity, user };
};

export const listFreelancers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "freelancer")).collect();
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
  },
});

export const getPostAuthDestination = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return "/sign-in";

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return "/onboarding/role";

    if (user.role === "parent") {
      const child = await ctx.db
        .query("children")
        .withIndex("by_parent", (q) => q.eq("parentId", user._id))
        .first();
      return child ? "/parent/dashboard" : "/onboarding/parent";
    }

    if (user.role === "school_student" || user.role === "university_student") {
      const child = await ctx.db
        .query("children")
        .withIndex("by_parent", (q) => q.eq("parentId", user._id))
        .first();

      if (!child) return "/onboarding/student";

      const dna = await ctx.db
        .query("learningDNA")
        .withIndex("by_child", (q) => q.eq("childId", child._id))
        .first();

      return dna ? "/student/dashboard" : "/onboarding/student";
    }

    if (user.role === "freelancer") {
      const completed = Boolean(user.skills?.length && user.bio && user.hourlyRate);
      return completed ? "/freelancer/dashboard" : "/onboarding/freelancer";
    }

    return "/onboarding/role";
  },
});

export const upsertFromClerk = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        email: args.email ?? existing.email,
        avatar: args.avatar ?? existing.avatar,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: args.email ?? identity.email ?? `${identity.subject}@clerk.local`,
      name: args.name ?? identity.name ?? "Learner",
      avatar: args.avatar,
      role: "school_student",
      createdAt: Date.now(),
    });
  },
});

export const setCurrentUserRole = mutation({
  args: {
    role: v.union(v.literal("parent"), v.literal("school_student"), v.literal("freelancer")),
  },
  handler: async (ctx, { role }) => {
    const { identity, user } = await getAuthedUser(ctx);

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email ?? `${identity.subject}@clerk.local`,
        name: identity.name ?? "Learner",
        role,
        createdAt: Date.now(),
      });
      return userId;
    }

    await ctx.db.patch(user._id, { role });
    return user._id;
  },
});

export const completeParentOnboarding = mutation({
  args: {
    name: v.string(),
    city: v.string(),
    childName: v.string(),
    childGrade: v.optional(v.string()),
    childSchool: v.optional(v.string()),
    helpTypes: v.array(v.string()),
    preferredLearningMode: v.union(v.literal("virtual"), v.literal("in_person"), v.literal("either")),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await getAuthedUser(ctx);

    const userId = user
      ? user._id
      : await ctx.db.insert("users", {
          clerkId: identity.subject,
          email: identity.email ?? `${identity.subject}@clerk.local`,
          name: args.name,
          role: "parent",
          city: args.city,
          helpTypes: args.helpTypes,
          preferredLearningMode: args.preferredLearningMode,
          createdAt: Date.now(),
        });

    await ctx.db.patch(userId, {
      name: args.name,
      city: args.city,
      role: "parent",
      helpTypes: args.helpTypes,
      preferredLearningMode: args.preferredLearningMode,
    });

    const existingChild = await ctx.db
      .query("children")
      .withIndex("by_parent", (q) => q.eq("parentId", userId))
      .filter((q) => q.eq(q.field("name"), args.childName))
      .first();

    const childId = existingChild
      ? existingChild._id
      : await ctx.db.insert("children", {
          parentId: userId,
          name: args.childName,
          school: args.childSchool,
          grade: args.childGrade,
          createdAt: Date.now(),
        });

    const dna = await ctx.db
      .query("learningDNA")
      .withIndex("by_child", (q) => q.eq("childId", childId))
      .first();

    if (!dna) {
      const dnaId = await ctx.db.insert("learningDNA", {
        childId,
        attentionSpan: "medium",
        explanationStyle: "mixed",
        confusionTriggers: [],
        encouragementNeeds: "medium",
        strongSubjects: [],
        interestSignals: [],
        rawSessionNotes: [],
        focusTopics: args.helpTypes,
        lastUpdated: Date.now(),
      });

      await ctx.db.patch(childId, { learningDNAId: dnaId });
    }

    return { userId, childId };
  },
});

export const completeStudentOnboarding = mutation({
  args: {
    name: v.string(),
    city: v.string(),
    educationStage: v.union(v.literal("middle_school"), v.literal("high_school"), v.literal("university")),
    schoolOrUniversity: v.string(),
    gradeOrYear: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await getAuthedUser(ctx);
    const role = args.educationStage === "university" ? "university_student" : "school_student";

    const parsedYear = Number.parseInt(args.gradeOrYear, 10);
    const safeYear = Number.isNaN(parsedYear) ? undefined : parsedYear;

    const userId = user
      ? user._id
      : await ctx.db.insert("users", {
          clerkId: identity.subject,
          email: identity.email ?? `${identity.subject}@clerk.local`,
          name: args.name,
          role,
          city: args.city,
          educationStage: args.educationStage,
          university: args.educationStage === "university" ? args.schoolOrUniversity : undefined,
          course: args.educationStage === "university" ? undefined : `Class ${args.gradeOrYear}`,
          year: safeYear,
          createdAt: Date.now(),
        });

    await ctx.db.patch(userId, {
      name: args.name,
      city: args.city,
      role,
      educationStage: args.educationStage,
      university: args.educationStage === "university" ? args.schoolOrUniversity : undefined,
      course: args.educationStage === "university" ? undefined : `Class ${args.gradeOrYear}`,
      year: safeYear,
    });

    const selfChild = await ctx.db
      .query("children")
      .withIndex("by_parent", (q) => q.eq("parentId", userId))
      .first();

    const childId = selfChild
      ? selfChild._id
      : await ctx.db.insert("children", {
          parentId: userId,
          name: args.name,
          school: args.schoolOrUniversity,
          grade: args.gradeOrYear,
          createdAt: Date.now(),
        });

    const dna = await ctx.db
      .query("learningDNA")
      .withIndex("by_child", (q) => q.eq("childId", childId))
      .first();

    if (!dna) {
      const dnaId = await ctx.db.insert("learningDNA", {
        childId,
        attentionSpan: "medium",
        explanationStyle: "mixed",
        confusionTriggers: [],
        encouragementNeeds: "medium",
        strongSubjects: [],
        interestSignals: [],
        rawSessionNotes: [],
        focusTopics: [],
        lastUpdated: Date.now(),
      });

      await ctx.db.patch(childId, { learningDNAId: dnaId });
    }

    return { userId, childId };
  },
});

export const completeFreelancerOnboarding = mutation({
  args: {
    name: v.string(),
    city: v.string(),
    university: v.string(),
    year: v.optional(v.number()),
    skills: v.array(v.string()),
    bio: v.string(),
    hourlyRate: v.number(),
  },
  handler: async (ctx, args) => {
    const { identity, user } = await getAuthedUser(ctx);

    const userId = user
      ? user._id
      : await ctx.db.insert("users", {
          clerkId: identity.subject,
          email: identity.email ?? `${identity.subject}@clerk.local`,
          name: args.name,
          role: "freelancer",
          city: args.city,
          university: args.university,
          year: args.year,
          skills: args.skills,
          bio: args.bio,
          hourlyRate: args.hourlyRate,
          studentIdVerified: true,
          createdAt: Date.now(),
        });

    await ctx.db.patch(userId, {
      name: args.name,
      role: "freelancer",
      city: args.city,
      university: args.university,
      year: args.year,
      skills: args.skills,
      bio: args.bio,
      hourlyRate: args.hourlyRate,
      studentIdVerified: true,
    });

    return { userId };
  },
});

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const { identity, user } = await getAuthedUser(ctx);
    const now = Date.now();

    const ensureUser = async (
      clerkId: string,
      data: {
        email: string;
        name: string;
        role: "parent" | "school_student" | "university_student" | "freelancer";
        city?: string;
        educationStage?: "middle_school" | "high_school" | "university";
        helpTypes?: string[];
        preferredLearningMode?: "virtual" | "in_person" | "either";
        university?: string;
        course?: string;
        year?: number;
        studentIdVerified?: boolean;
        skills?: string[];
        bio?: string;
        hourlyRate?: number;
        rating?: number;
        ratingCount?: number;
        walletBalance?: number;
        totalEarned?: number;
      }
    ) => {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, data);
        return existing._id;
      }

      return await ctx.db.insert("users", {
        clerkId,
        createdAt: now,
        ...data,
      });
    };

    const ensureChildAndDna = async (
      parentId: any,
      childName: string,
      childGrade: string,
      school: string,
      attentionSpan: "short" | "medium" | "long",
      explanationStyle: "visual" | "verbal" | "hands_on" | "mixed",
      encouragementNeeds: "high" | "medium" | "low",
      strongSubjects: string[],
      confusionTriggers: string[],
      interestSignals: string[]
    ) => {
      const children = await ctx.db
        .query("children")
        .withIndex("by_parent", (q) => q.eq("parentId", parentId))
        .collect();
      const existingChild = children.find((c: any) => c.name === childName);

      const childId =
        existingChild?._id ??
        (await ctx.db.insert("children", {
          parentId,
          name: childName,
          grade: childGrade,
          school,
          createdAt: now,
        }));

      const existingDna = await ctx.db
        .query("learningDNA")
        .withIndex("by_child", (q) => q.eq("childId", childId))
        .first();

      const dnaPayload = {
        attentionSpan,
        explanationStyle,
        encouragementNeeds,
        strongSubjects,
        confusionTriggers,
        interestSignals,
        rawSessionNotes: [
          "Understands better when examples relate to football and robotics.",
          "Loses focus after 25 minutes without active participation.",
        ],
        focusTopics: ["algebra", "science models", "presentation confidence"],
        lastUpdated: now,
      };

      const dnaId = existingDna
        ? (await ctx.db.patch(existingDna._id, dnaPayload), existingDna._id)
        : await ctx.db.insert("learningDNA", { childId, ...dnaPayload });

      await ctx.db.patch(childId, { learningDNAId: dnaId });
      return { childId, dnaId };
    };

    const demoParentId = await ensureUser("demo-parent", {
      email: "parent.demo@pahechan.dev",
      name: "Priya Sharma",
      role: "parent",
      city: "Mumbai",
      helpTypes: ["Science", "Coding", "Writing"],
      preferredLearningMode: "either",
      rating: 4.8,
      ratingCount: 12,
      walletBalance: 4200,
      totalEarned: 0,
    });

    const demoSchoolStudentId = await ensureUser("demo-school-student", {
      email: "school.student.demo@pahechan.dev",
      name: "Aarav Mehta",
      role: "school_student",
      city: "Mumbai",
      educationStage: "high_school",
      course: "Class 10",
      year: 10,
      studentIdVerified: true,
      rating: 4.6,
      ratingCount: 6,
    });

    const demoUniversityStudentId = await ensureUser("demo-university-student", {
      email: "university.student.demo@pahechan.dev",
      name: "Sneha Iyer",
      role: "university_student",
      city: "Pune",
      educationStage: "university",
      university: "IIT Bombay",
      course: "B.Tech CSE",
      year: 3,
      studentIdVerified: true,
      rating: 4.7,
      ratingCount: 8,
    });

    const demoFreelancerId = await ensureUser("demo-freelancer", {
      email: "freelancer.demo@pahechan.dev",
      name: "Rohan Verma",
      role: "freelancer",
      city: "Mumbai",
      university: "VJTI",
      course: "Engineering",
      year: 4,
      studentIdVerified: true,
      skills: ["Math", "Science Projects", "Python", "Arduino", "Public Speaking"],
      bio: "Final-year engineering student helping school learners build confidence with practical examples.",
      hourlyRate: 600,
      rating: 4.9,
      ratingCount: 42,
      walletBalance: 18000,
      totalEarned: 76500,
    });

    const currentUserId =
      user?._id ??
      (await ensureUser(identity.subject, {
        email: identity.email ?? `${identity.subject}@clerk.local`,
        name: identity.name ?? "Learner",
        role: "parent",
        city: "Mumbai",
        helpTypes: ["Science", "Math"],
        preferredLearningMode: "either",
      }));

    const currentDbUser = user ?? (await ctx.db.get(currentUserId));

    const parentForDashboardId =
      currentDbUser && currentDbUser.role === "parent" ? currentDbUser._id : demoParentId;

    const { childId } = await ensureChildAndDna(
      parentForDashboardId,
      "Anaya Sharma",
      "Class 7",
      "Green Valley Public School",
      "medium",
      "hands_on",
      "high",
      ["Science", "Art"],
      ["Long formulas", "Dense text-only explanations"],
      ["Experiments", "Space", "DIY models"]
    );

    const parentProjects = await ctx.db
      .query("projects")
      .withIndex("by_requester", (q) => q.eq("requesterId", parentForDashboardId))
      .collect();

    const ensureProject = async (
      title: string,
      status: "open" | "in_progress" | "completed" | "cancelled",
      subject: string,
      description: string,
      serviceMode: "guided_session" | "accompanied_build" | "full_build",
      budgetMin: number,
      budgetMax: number
    ) => {
      const existing = parentProjects.find((p: any) => p.title === title);
      if (existing) {
        await ctx.db.patch(existing._id, {
          status,
          subject,
          description,
          serviceMode,
          budgetMin,
          budgetMax,
          childId,
          city: "Mumbai",
          grade: "Class 7",
          isRemote: true,
          requesterType: "parent",
          deadline: now + 5 * 24 * 60 * 60 * 1000,
          suggestedFreelancerIds: [demoFreelancerId],
        });
        return existing._id;
      }

      return await ctx.db.insert("projects", {
        requesterId: parentForDashboardId,
        requesterType: "parent",
        childId,
        title,
        description,
        subject,
        grade: "Class 7",
        deadline: now + 5 * 24 * 60 * 60 * 1000,
        budgetMin,
        budgetMax,
        city: "Mumbai",
        isRemote: true,
        serviceMode,
        status,
        suggestedFreelancerIds: [demoFreelancerId],
        createdAt: now,
      });
    };

    const openProjectId = await ensureProject(
      "Build a Solar System Working Model",
      "open",
      "Science",
      "Need concept-first support so my child can explain each planet and rotation confidently.",
      "guided_session",
      900,
      1500
    );

    const inProgressProjectId = await ensureProject(
      "Fractions through Cooking Activities",
      "in_progress",
      "Math",
      "Want practical understanding of fractions through hands-on tasks and visual examples.",
      "accompanied_build",
      700,
      1200
    );

    const ensureProposal = async (
      projectId: any,
      freelancerId: any,
      price: number,
      approach: string,
      status: "pending" | "accepted" | "rejected" | "withdrawn"
    ) => {
      const existing = await ctx.db
        .query("proposals")
        .withIndex("by_project_and_freelancer", (q) => q.eq("projectId", projectId).eq("freelancerId", freelancerId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          price,
          approach,
          availability: "Weekday evenings and weekends",
          estimatedDuration: "2-3 sessions",
          status,
          createdAt: now,
        });
        return existing._id;
      }

      return await ctx.db.insert("proposals", {
        projectId,
        freelancerId,
        price,
        approach,
        availability: "Weekday evenings and weekends",
        estimatedDuration: "2-3 sessions",
        status,
        createdAt: now,
      });
    };

    const pendingProposalId = await ensureProposal(
      openProjectId,
      demoFreelancerId,
      1200,
      "I use storytelling + mini experiments so the child can present confidently in school.",
      "pending"
    );

    const acceptedProposalId = await ensureProposal(
      inProgressProjectId,
      demoFreelancerId,
      950,
      "Hands-on cooking measurements to teach numerator/denominator and real-life applications.",
      "accepted"
    );

    await ctx.db.patch(inProgressProjectId, {
      status: "in_progress",
      acceptedProposalId,
      acceptedFreelancerId: demoFreelancerId,
    });

    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("by_project", (q) => q.eq("projectId", inProgressProjectId))
      .first();

    const sessionId =
      existingSession?._id ??
      (await ctx.db.insert("sessions", {
        projectId: inProgressProjectId,
        freelancerId: demoFreelancerId,
        requesterId: parentForDashboardId,
        status: "in_progress",
        sessionType: "virtual",
        startedAt: now - 30 * 60 * 1000,
        copilotConsentGiven: true,
        sessionTranscriptChunks: [
          "Learner grasped equivalent fractions after visual pizza slices example.",
          "Needs one more confidence round for word problems.",
        ],
        createdAt: now,
      }));

    const existingReport = await ctx.db
      .query("sessionReports")
      .withIndex("by_parent", (q) => q.eq("parentId", parentForDashboardId))
      .collect();
    const hasReportForProject = existingReport.some((r: any) => r.projectId === inProgressProjectId);

    if (!hasReportForProject) {
      await ctx.db.insert("sessionReports", {
        sessionId,
        projectId: inProgressProjectId,
        parentId: parentForDashboardId,
        childId,
        whatWeCovered: "Equivalent fractions using real-life food portion examples.",
        whatChildFoundHard: "Converting mixed fractions into improper fractions quickly.",
        whatToReinforceAtHome: "Practice fraction stories during dinner prep for 10 minutes.",
        materialsToBuy: ["Measuring cups", "Fraction flashcards"],
        freelancerObservation: "Very curious learner; confidence improves with visual prompts.",
        interestSignalsDetected: ["Cooking", "Drawing diagrams"],
        emailSent: false,
        createdAt: now,
      });
    }

    const existingOpportunity = await ctx.db
      .query("opportunities")
      .withIndex("by_freelancer", (q) => q.eq("freelancerId", demoFreelancerId))
      .collect();

    if (!existingOpportunity.length) {
      await ctx.db.insert("opportunities", {
        freelancerId: demoFreelancerId,
        title: "STEM Mentor Needed for Weekend Learning Lab",
        url: "https://example.org/opportunity/stem-mentor",
        description: "Mentor school learners in hands-on science and coding mini projects.",
        aiSummary: "High-fit role for project-based teaching portfolios and concept-first mentors.",
        category: "gig",
        deadline: "2026-04-10",
        prize: "₹8,000 stipend",
        relevanceScore: 0.92,
        expiresAt: now + 10 * 24 * 60 * 60 * 1000,
        createdAt: now,
      });
    }

    const existingRequest = await ctx.db
      .query("crashCourseRequests")
      .withIndex("by_requester", (q) => q.eq("requesterId", demoUniversityStudentId))
      .collect();

    if (!existingRequest.length) {
      await ctx.db.insert("crashCourseRequests", {
        requesterId: demoUniversityStudentId,
        topic: "Pointers in C",
        subjectArea: "Programming",
        description: "Need conceptual clarity with memory diagrams and practice questions.",
        estimatedDepth: "intermediate",
        preferredFormat: "either",
        budgetPerSession: 500,
        isRemote: true,
        status: "open",
        createdAt: now,
      });
    }

    return {
      seeded: true,
      parentForDashboardId,
      openProjectId,
      inProgressProjectId,
      pendingProposalId,
      acceptedProposalId,
      demoUsers: {
        demoParentId,
        demoSchoolStudentId,
        demoUniversityStudentId,
        demoFreelancerId,
      },
    };
  },
});
