import { query } from "./_generated/server";
import { v } from "convex/values";

export const topByRequestCount = query({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db.query("demandSignals").withIndex("by_request_count").order("desc").take(limit);
    return rows;
  },
});
