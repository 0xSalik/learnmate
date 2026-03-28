import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const messages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    return await ctx.db.query("messages").withIndex("by_conversation", (q) => q.eq("conversationId", conversationId)).collect();
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      type: "text",
      createdAt: Date.now(),
    });
  },
});
