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

export const createForCurrentUser = mutation({
  args: {
    projectId: v.id("projects"),
    price: v.number(),
    approach: v.string(),
    availability: v.string(),
    estimatedDuration: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);
    if (user.role !== "freelancer") {
      throw new Error("Only freelancers can place bids");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.status !== "open") throw new Error("Bidding is closed for this project");

    const existing = await ctx.db
      .query("proposals")
      .withIndex("by_project_and_freelancer", (q) =>
        q.eq("projectId", args.projectId).eq("freelancerId", user._id)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        price: args.price,
        approach: args.approach,
        availability: args.availability,
        estimatedDuration: args.estimatedDuration,
        status: "pending",
        createdAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("proposals", {
      projectId: args.projectId,
      freelancerId: user._id,
      price: args.price,
      approach: args.approach,
      availability: args.availability,
      estimatedDuration: args.estimatedDuration,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const countByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const rows = await ctx.db.query("proposals").withIndex("by_project", (q) => q.eq("projectId", projectId)).collect();
    return rows.length;
  },
});
