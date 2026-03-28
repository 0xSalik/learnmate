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

export const byFreelancer = query({
  args: { freelancerId: v.id("users") },
  handler: async (ctx, { freelancerId }) => {
    return await ctx.db
      .query("opportunities")
      .withIndex("by_freelancer", (q) => q.eq("freelancerId", freelancerId))
      .order("desc")
      .take(30);
  },
});

export const byCurrentFreelancer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUser(ctx);
    if (user.role !== "freelancer") return [];

    return await ctx.db
      .query("opportunities")
      .withIndex("by_freelancer", (q) => q.eq("freelancerId", user._id))
      .order("desc")
      .take(30);
  },
});

export const upsertForCurrentFreelancer = mutation({
  args: {
    items: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
        description: v.string(),
        aiSummary: v.string(),
        category: v.union(
          v.literal("gig"),
          v.literal("internship"),
          v.literal("hackathon"),
          v.literal("scholarship"),
          v.literal("competition"),
          v.literal("volunteer")
        ),
        deadline: v.optional(v.string()),
        prize: v.optional(v.string()),
        relevanceScore: v.number(),
        expiresAt: v.number(),
      })
    ),
  },
  handler: async (ctx, { items }) => {
    const user = await getAuthedUser(ctx);
    if (user.role !== "freelancer") {
      throw new Error("Only freelancer accounts can store opportunities");
    }

    const existing = await ctx.db
      .query("opportunities")
      .withIndex("by_freelancer", (q) => q.eq("freelancerId", user._id))
      .take(50);

    let updated = 0;
    let inserted = 0;

    for (const item of items) {
      const match = existing.find((e: any) => e.url === item.url);
      if (match) {
        await ctx.db.patch(match._id, {
          title: item.title,
          description: item.description,
          aiSummary: item.aiSummary,
          category: item.category,
          deadline: item.deadline,
          prize: item.prize,
          relevanceScore: item.relevanceScore,
          expiresAt: item.expiresAt,
        });
        updated += 1;
      } else {
        await ctx.db.insert("opportunities", {
          freelancerId: user._id,
          title: item.title,
          url: item.url,
          description: item.description,
          aiSummary: item.aiSummary,
          category: item.category,
          deadline: item.deadline,
          prize: item.prize,
          relevanceScore: item.relevanceScore,
          expiresAt: item.expiresAt,
          createdAt: Date.now(),
        });
        inserted += 1;
      }
    }

    return { updated, inserted, total: items.length };
  },
});
