import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const enroll = mutation({
  args: {
    groupSessionId: v.id("groupSessions"),
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("enrollments", {
      ...args,
      paymentStatus: "pending",
      createdAt: Date.now(),
    });
  },
});
