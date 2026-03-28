import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byId = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, { sessionId }) => ctx.db.get(sessionId),
});

export const transitionState = mutation({
  args: {
    sessionId: v.id("sessions"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rated")
    ),
  },
  handler: async (ctx, { sessionId, status }) => {
    await ctx.db.patch(sessionId, {
      status,
      startedAt: status === "in_progress" ? Date.now() : undefined,
      endedAt: status === "completed" ? Date.now() : undefined,
    });
  },
});
