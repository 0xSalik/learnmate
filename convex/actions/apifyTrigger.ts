"use node";
import { internalAction } from "../_generated/server";

export const triggerPricingBenchmarkScrape = internalAction({
  args: {},
  handler: async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/apify/trigger`;
    await fetch(endpoint, { method: "POST" });
  },
});
