// @ts-nocheck
import { internalAction, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const textToEmbedding = (text: string, dims = 32) => {
  const vector = Array.from({ length: dims }, () => 0);
  const normalized = text.trim().toLowerCase();
  if (!normalized.length) return vector;

  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    vector[i % dims] += code / 255;
  }

  const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0)) || 1;
  return vector.map((value) => value / magnitude);
};

const cosineSimilarity = (a: number[], b: number[]) => {
  const dot = a.reduce((acc, value, index) => acc + value * (b[index] ?? 0), 0);
  const na = Math.sqrt(a.reduce((acc, value) => acc + value * value, 0));
  const nb = Math.sqrt(b.reduce((acc, value) => acc + value * value, 0));
  if (!na || !nb) return 0;
  return dot / (na * nb);
};

export const generateProjectEmbedding = internalAction({
  args: { projectId: v.id("projects"), text: v.string() },
  handler: async (ctx, { projectId, text }) => {
    const embedding = textToEmbedding(text);
    await ctx.runMutation(internal.matching.updateProjectEmbedding, {
      projectId,
      embedding,
    });
  },
});

export const updateProjectEmbedding = mutation({
  args: { projectId: v.id("projects"), embedding: v.array(v.float64()) },
  handler: async (ctx, { projectId, embedding }) => {
    await ctx.db.patch(projectId, { embedding });
  },
});

export const matchFreelancersToProject = internalAction({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.runQuery(internal.matching.getProjectInternal, { projectId });
    if (!project?.embedding) return;
    const freelancers = await ctx.runQuery(internal.matching.getFreelancersWithEmbeddings, {});

    const top5 = freelancers
      .map((freelancer) => ({
        id: freelancer._id,
        score: cosineSimilarity(project.embedding!, freelancer.profileEmbedding ?? []),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.id);

    await ctx.runMutation(internal.matching.storeSuggestedFreelancers, {
      projectId,
      ids: top5,
    });
  },
});

export const getProjectInternal = internalAction({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => ctx.db.get(projectId),
});

export const getFreelancersWithEmbeddings = internalAction({
  args: {},
  handler: async (ctx) => {
    const freelancers = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "freelancer")).collect();
    return freelancers.filter((f) => f.profileEmbedding?.length);
  },
});

export const storeSuggestedFreelancers = mutation({
  args: { projectId: v.id("projects"), ids: v.array(v.id("users")) },
  handler: async (ctx, { projectId, ids }) => {
    await ctx.db.patch(projectId, { suggestedFreelancerIds: ids });
  },
});

export const triggerMatchingForProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return;
    const text = `${project.title}\n${project.description}\n${project.subject}\n${project.serviceMode}`;
    await ctx.scheduler.runAfter(0, internal.matching.generateProjectEmbedding, {
      projectId,
      text,
    });
    await ctx.scheduler.runAfter(1000, internal.matching.matchFreelancersToProject, {
      projectId,
    });
  },
});
