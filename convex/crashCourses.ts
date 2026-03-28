import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getAuthedUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) throw new Error("User profile not found");
  return user;
};

export const createRequest = mutation({
  args: {
    requesterId: v.id("users"),
    topic: v.string(),
    subjectArea: v.string(),
    description: v.string(),
    estimatedDepth: v.union(v.literal("introductory"), v.literal("intermediate"), v.literal("advanced")),
    preferredFormat: v.union(v.literal("one_on_one"), v.literal("group_class"), v.literal("either")),
    budgetPerSession: v.number(),
    isRemote: v.boolean(),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("crashCourseRequests", {
      ...args,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const byTopic = query({
  args: { topic: v.string() },
  handler: async (ctx, { topic }) => {
    return await ctx.db.query("crashCourseRequests").withIndex("by_topic", (q) => q.eq("topic", topic)).collect();
  },
});

export const createForCurrentUser = mutation({
  args: {
    topic: v.string(),
    subjectArea: v.string(),
    description: v.string(),
    estimatedDepth: v.union(v.literal("introductory"), v.literal("intermediate"), v.literal("advanced")),
    preferredFormat: v.union(v.literal("one_on_one"), v.literal("group_class"), v.literal("either")),
    budgetPerSession: v.number(),
    isRemote: v.boolean(),
    deadline: v.optional(v.number()),
    intentClassification: v.optional(
      v.object({
        intent: v.string(),
        isTooAssignmentSpecific: v.boolean(),
        confidence: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);
    if (user.role !== "school_student" && user.role !== "university_student") {
      throw new Error("Only student accounts can post crash course requests");
    }

    return await ctx.db.insert("crashCourseRequests", {
      requesterId: user._id,
      topic: args.topic,
      subjectArea: args.subjectArea,
      description: args.description,
      estimatedDepth: args.estimatedDepth,
      preferredFormat: args.preferredFormat,
      budgetPerSession: args.budgetPerSession,
      deadline: args.deadline,
      isRemote: args.isRemote,
      intentClassification: args.intentClassification,
      status: "open",
      createdAt: Date.now(),
    });
  },
});
