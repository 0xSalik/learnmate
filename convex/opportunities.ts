import { query } from "./_generated/server";
import { v } from "convex/values";

export const byFreelancer = query({
  args: { freelancerId: v.id("users") },
  handler: async (ctx, { freelancerId }) => {
    return await ctx.db.query("opportunities").withIndex("by_freelancer", (q) => q.eq("freelancerId", freelancerId)).collect();
  },
});
