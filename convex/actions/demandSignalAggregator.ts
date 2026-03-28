// @ts-nocheck
"use node";
import { internalAction } from "../_generated/server";

export const aggregateDemandSignalsHourly = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const requests = await ctx.db.query("crashCourseRequests").collect();

    const grouped = new Map<string, {
      topic: string;
      subjectArea: string;
      count7: number;
      count24: number;
      budget: number[];
      cities: string[];
      remoteTrue: number;
      total: number;
    }>();

    for (const row of requests) {
      if (row.createdAt < sevenDaysAgo) continue;
      const key = `${row.topic}::${row.subjectArea}`;
      const current = grouped.get(key) ?? {
        topic: row.topic,
        subjectArea: row.subjectArea,
        count7: 0,
        count24: 0,
        budget: [],
        cities: [],
        remoteTrue: 0,
        total: 0,
      };
      current.count7 += 1;
      if (row.createdAt >= dayAgo) current.count24 += 1;
      current.budget.push(row.budgetPerSession);
      if (row.isRemote) current.remoteTrue += 1;
      current.total += 1;
      grouped.set(key, current);
    }

    for (const [, agg] of grouped) {
      const avg = agg.budget.length
        ? Math.round(agg.budget.reduce((a, b) => a + b, 0) / agg.budget.length)
        : 0;

      const trendDirection = agg.count24 > Math.max(3, Math.floor(agg.count7 / 4))
        ? "rising"
        : agg.count24 === 0
          ? "falling"
          : "stable";

      const existing = await ctx.db.query("demandSignals").withIndex("by_topic", (q) => q.eq("topic", agg.topic)).first();
      const payload = {
        topic: agg.topic,
        subjectArea: agg.subjectArea,
        requestCount7d: agg.count7,
        requestCount24h: agg.count24,
        avgBudgetOffered: avg,
        topCities: agg.cities.slice(0, 3),
        isRemotePreferred: agg.remoteTrue >= Math.ceil(agg.total / 2),
        trendDirection,
        lastUpdated: now,
      } as const;
      if (existing) {
        await ctx.db.patch(existing._id, payload);
      } else {
        await ctx.db.insert("demandSignals", payload);
      }

      if (agg.count24 > 5) {
        const openGroups = await ctx.db.query("groupSessions").withIndex("by_topic", (q) => q.eq("topic", agg.topic)).collect();
        const hasOpen = openGroups.some((gs) => gs.status === "open");
        if (!hasOpen) {
          const freelancers = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "freelancer")).take(5);
          for (const f of freelancers) {
            await ctx.db.insert("notifications", {
              userId: f._id,
              type: "high_demand_alert",
              title: `High demand for ${agg.topic}`,
              body: "No class is open yet. Create one now to capture demand.",
              read: false,
              createdAt: now,
            });
          }
        }
      }
    }
  },
});
