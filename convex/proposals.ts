import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db.query("proposals").withIndex("by_project", (q) => q.eq("projectId", projectId)).collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    freelancerId: v.id("users"),
    price: v.number(),
    approach: v.string(),
    availability: v.string(),
    estimatedDuration: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("proposals", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});
