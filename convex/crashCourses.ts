import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
