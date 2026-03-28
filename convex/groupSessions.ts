import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
