import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const unreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db.query("notifications").withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false)).collect();
    return rows.length;
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("new_proposal"),
      v.literal("proposal_accepted"),
      v.literal("session_starting"),
      v.literal("proof_of_learning_ready"),
      v.literal("report_ready"),
      v.literal("payment_received"),
      v.literal("new_opportunity"),
      v.literal("mentor_chain_match"),
      v.literal("crash_course_match"),
      v.literal("high_demand_alert"),
      v.literal("group_session_seat_taken"),
      v.literal("group_session_almost_full")
    ),
    title: v.string(),
    body: v.string(),
    linkPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
      createdAt: Date.now(),
    });
  },
});
