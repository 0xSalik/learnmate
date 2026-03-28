import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byStatus = query({
  args: { status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")) },
  handler: async (ctx, { status }) => {
    return await ctx.db.query("projects").withIndex("by_status", (q) => q.eq("status", status)).collect();
  },
});

export const byId = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    requesterId: v.id("users"),
    requesterType: v.union(v.literal("parent"), v.literal("school_student"), v.literal("university_student")),
    title: v.string(),
    description: v.string(),
    subject: v.string(),
    deadline: v.number(),
    budgetMin: v.number(),
    budgetMax: v.number(),
    isRemote: v.boolean(),
    serviceMode: v.union(v.literal("guided_session"), v.literal("accompanied_build"), v.literal("full_build")),
    city: v.optional(v.string()),
    grade: v.optional(v.string()),
    childId: v.optional(v.id("children")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      status: "open",
      createdAt: Date.now(),
    });
  },
});
