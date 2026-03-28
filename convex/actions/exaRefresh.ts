"use node";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";

export const refreshOpportunitiesForFreelancer = internalAction({
  args: { freelancerId: v.id("users") },
  handler: async (_ctx, { freelancerId }) => {
    const endpoint = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/exa/opportunities`;
    await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ freelancerId }),
    });
  },
});
