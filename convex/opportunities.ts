import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getAuthedUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  if (!identity.subject) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) throw new Error("User profile not found");
  return user;
};

const getAuthedUserOrNull = async (ctx: any) => {
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    if (!identity.subject) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first();

    return user ?? null;
  } catch {
    return null;
  }
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
    try {
      const user = await getAuthedUserOrNull(ctx);
      if (!user) return [];
      if (user.role !== "freelancer") return [];

      return await ctx.db
        .query("opportunities")
        .withIndex("by_freelancer", (q) => q.eq("freelancerId", user._id))
        .order("desc")
        .take(30);
    } catch {
      return [];
    }
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

    const normalizeCategory = (
      value: string
    ): "gig" | "internship" | "hackathon" | "scholarship" | "competition" | "volunteer" => {
      if (
        value === "internship" ||
        value === "hackathon" ||
        value === "scholarship" ||
        value === "competition" ||
        value === "volunteer"
      ) {
        return value;
      }
      return "gig";
    };

    for (const item of items.slice(0, 30)) {
      const safeUrl = String(item.url || "").trim() || `https://example.com/opportunity/${Date.now()}`;
      const safeTitle = String(item.title || "").trim() || "Opportunity";
      const safeDescription = String(item.description || "");
      const safeSummary = String(item.aiSummary || "Relevant opportunity.");
      const safeCategory = normalizeCategory(item.category);
      const safeDeadline = item.deadline ? String(item.deadline) : undefined;
      const safePrize = item.prize ? String(item.prize) : undefined;
      const safeScore = Number.isFinite(item.relevanceScore) ? item.relevanceScore : 0.7;
      const safeExpiresAt = Number.isFinite(item.expiresAt)
        ? item.expiresAt
        : Date.now() + 7 * 24 * 60 * 60 * 1000;

      const match = existing.find((e: any) => e.url === safeUrl);
      if (match) {
        await ctx.db.patch(match._id, {
          title: safeTitle,
          description: safeDescription,
          aiSummary: safeSummary,
          category: safeCategory,
          deadline: safeDeadline,
          prize: safePrize,
          relevanceScore: safeScore,
          expiresAt: safeExpiresAt,
        });
        updated += 1;
      } else {
        await ctx.db.insert("opportunities", {
          freelancerId: user._id,
          title: safeTitle,
          url: safeUrl,
          description: safeDescription,
          aiSummary: safeSummary,
          category: safeCategory,
          deadline: safeDeadline,
          prize: safePrize,
          relevanceScore: safeScore,
          expiresAt: safeExpiresAt,
          createdAt: Date.now(),
        });
        inserted += 1;
      }
    }

    return { updated, inserted, total: items.length };
  },
});
