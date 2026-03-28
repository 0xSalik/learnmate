import { query } from "./_generated/server";
import { v } from "convex/values";

export const byCategoryAndCity = query({
  args: { category: v.string(), city: v.string() },
  handler: async (ctx, { category, city }) => {
    return await ctx.db.query("pricingBenchmarks").withIndex("by_category_city", (q) => q.eq("category", category).eq("city", city)).first();
  },
});
