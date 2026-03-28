import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const requireIdentity = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity;
};

const getCurrentUser = async (ctx: any, clerkId: string) => {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
    .first();
};

export const listForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const user = await getCurrentUser(ctx, identity.subject);
    if (!user) return [];

    return await ctx.db.query("children").withIndex("by_parent", (q) => q.eq("parentId", user._id)).collect();
  },
});

export const listWithDnaForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const user = await getCurrentUser(ctx, identity.subject);
    if (!user) return [];

    const children = await ctx.db
      .query("children")
      .withIndex("by_parent", (q) => q.eq("parentId", user._id))
      .collect();

    const result = [];
    for (const child of children) {
      const dna = await ctx.db
        .query("learningDNA")
        .withIndex("by_child", (q) => q.eq("childId", child._id))
        .first();
      result.push({ child, dna });
    }

    return result;
  },
});

export const byIdForCurrentUser = query({
  args: { childId: v.id("children") },
  handler: async (ctx, { childId }) => {
    const identity = await requireIdentity(ctx);
    const user = await getCurrentUser(ctx, identity.subject);
    if (!user) return null;

    const child = await ctx.db.get(childId);
    if (!child) return null;

    if (child.parentId !== user._id && user.role !== "freelancer") {
      return null;
    }

    return child;
  },
});

export const addForCurrentUser = mutation({
  args: {
    name: v.string(),
    grade: v.optional(v.string()),
    school: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const user = await getCurrentUser(ctx, identity.subject);
    if (!user) throw new Error("User record missing");

    if (user.role !== "parent") {
      throw new Error("Only parents can add child records");
    }

    return await ctx.db.insert("children", {
      parentId: user._id,
      name: args.name,
      grade: args.grade,
      school: args.school,
      createdAt: Date.now(),
    });
  },
});
