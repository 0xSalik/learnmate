import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getCurrentUserFromIdentity = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  return user;
};

export const byChild = query({
  args: { childId: v.id("children") },
  handler: async (ctx, { childId }) => {
    return await ctx.db.query("learningDNA").withIndex("by_child", (q) => q.eq("childId", childId)).first();
  },
});

export const upsertFromSession = mutation({
  args: {
    childId: v.id("children"),
    notes: v.string(),
  },
  handler: async (ctx, { childId, notes }) => {
    const existing = await ctx.db.query("learningDNA").withIndex("by_child", (q) => q.eq("childId", childId)).first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        rawSessionNotes: [...existing.rawSessionNotes.slice(-9), notes],
        lastUpdated: Date.now(),
      });
      return existing._id;
    }
    return await ctx.db.insert("learningDNA", {
      childId,
      attentionSpan: "medium",
      explanationStyle: "mixed",
      confusionTriggers: [],
      encouragementNeeds: "medium",
      strongSubjects: [],
      interestSignals: [],
      rawSessionNotes: [notes],
      lastUpdated: Date.now(),
    });
  },
});

export const byCurrentStudent = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserFromIdentity(ctx);
    if (!user) return null;

    const child = await ctx.db.query("children").withIndex("by_parent", (q) => q.eq("parentId", user._id)).first();
    if (!child) return null;

    const dna = await ctx.db.query("learningDNA").withIndex("by_child", (q) => q.eq("childId", child._id)).first();
    if (!dna) return null;

    return {
      child,
      dna,
    };
  },
});

export const updateCurrentStudentDNA = mutation({
  args: {
    attentionSpan: v.union(v.literal("short"), v.literal("medium"), v.literal("long")),
    explanationStyle: v.union(
      v.literal("visual"),
      v.literal("verbal"),
      v.literal("hands_on"),
      v.literal("mixed")
    ),
    encouragementNeeds: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    confusionTriggers: v.array(v.string()),
    interestSignals: v.array(v.string()),
    strongSubjects: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserFromIdentity(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const child = await ctx.db.query("children").withIndex("by_parent", (q) => q.eq("parentId", user._id)).first();
    if (!child) {
      throw new Error("Student profile not initialized");
    }

    const existing = await ctx.db
      .query("learningDNA")
      .withIndex("by_child", (q) => q.eq("childId", child._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        lastUpdated: Date.now(),
      });
      return existing._id;
    }

    const dnaId = await ctx.db.insert("learningDNA", {
      childId: child._id,
      ...args,
      rawSessionNotes: [],
      focusTopics: [],
      lastUpdated: Date.now(),
    });

    await ctx.db.patch(child._id, { learningDNAId: dnaId });
    return dnaId;
  },
});
