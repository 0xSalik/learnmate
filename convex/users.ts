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
