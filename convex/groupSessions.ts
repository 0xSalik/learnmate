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

export const openSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("groupSessions").withIndex("by_status", (q) => q.eq("status", "open")).collect();
  },
});

export const create = mutation({
  args: {
    freelancerId: v.id("users"),
    title: v.string(),
    topic: v.string(),
    subjectArea: v.string(),
    description: v.string(),
    outline: v.array(v.object({
      segment: v.string(),
      durationMinutes: v.number(),
      whatYouWillUnderstand: v.string(),
    })),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    maxSeats: v.number(),
    pricePerSeat: v.number(),
    isRemote: v.boolean(),
    meetingLink: v.optional(v.string()),
    city: v.optional(v.string()),
    aiAssisted: v.boolean(),
    proofOfLearningEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("groupSessions", {
      ...args,
      filledSeats: 0,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const createForCurrentUser = mutation({
  args: {
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
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    maxSeats: v.number(),
    pricePerSeat: v.number(),
    isRemote: v.boolean(),
    meetingLink: v.optional(v.string()),
    city: v.optional(v.string()),
    aiAssisted: v.boolean(),
    proofOfLearningEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);
    if (user.role !== "freelancer") {
      throw new Error("Only freelancer accounts can create group sessions");
    }

    return await ctx.db.insert("groupSessions", {
      freelancerId: user._id,
      title: args.title,
      topic: args.topic,
      subjectArea: args.subjectArea,
      description: args.description,
      outline: args.outline,
      aiAssisted: args.aiAssisted,
      scheduledAt: args.scheduledAt,
      durationMinutes: args.durationMinutes,
      maxSeats: args.maxSeats,
      filledSeats: 0,
      pricePerSeat: args.pricePerSeat,
      isRemote: args.isRemote,
      meetingLink: args.meetingLink,
      city: args.city,
      status: "open",
      proofOfLearningEnabled: args.proofOfLearningEnabled,
      createdAt: Date.now(),
    });
  },
});

export const byCurrentFreelancer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUser(ctx);
    if (user.role !== "freelancer") return [];

    return await ctx.db
      .query("groupSessions")
      .withIndex("by_freelancer", (q) => q.eq("freelancerId", user._id))
      .order("desc")
      .take(30);
  },
});
