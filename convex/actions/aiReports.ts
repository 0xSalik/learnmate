"use node";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";

export const sendSessionReportEmail = internalAction({
  args: {
    reportId: v.id("sessionReports"),
    parentEmail: v.string(),
  },
  handler: async (_ctx: unknown, { reportId, parentEmail }: { reportId: string; parentEmail: string }) => {
    console.log("Scheduled report email", reportId, parentEmail);
  },
});
