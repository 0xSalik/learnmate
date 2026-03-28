import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getAuthedUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first();

  if (!user) throw new Error("User profile not found");
  return user;
};

export const byStatus = query({
  args: { status: v.union(v.literal("open"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")) },
  handler: async (ctx, { status }) => {
    return await ctx.db.query("projects").withIndex("by_status", (q) => q.eq("status", status)).collect();
  },
});

export const byId = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    requesterId: v.id("users"),
    requesterType: v.union(v.literal("parent"), v.literal("school_student"), v.literal("university_student")),
    title: v.string(),
    description: v.string(),
    subject: v.string(),
    deadline: v.number(),
    budgetMin: v.number(),
    budgetMax: v.number(),
    isRemote: v.boolean(),
    serviceMode: v.union(v.literal("guided_session"), v.literal("accompanied_build"), v.literal("full_build")),
    city: v.optional(v.string()),
    grade: v.optional(v.string()),
    childId: v.optional(v.id("children")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const listOpen = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").withIndex("by_status", (q) => q.eq("status", "open")).collect();
  },
});

export const listByCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthedUser(ctx);
    return await ctx.db.query("projects").withIndex("by_requester", (q) => q.eq("requesterId", user._id)).collect();
  },
});

export const createForCurrentUser = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    subject: v.string(),
    deadline: v.number(),
    budgetMin: v.number(),
    budgetMax: v.number(),
    isRemote: v.boolean(),
    serviceMode: v.union(v.literal("guided_session"), v.literal("accompanied_build"), v.literal("full_build")),
    city: v.optional(v.string()),
    grade: v.optional(v.string()),
    childId: v.optional(v.id("children")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthedUser(ctx);
    if (user.role !== "parent" && user.role !== "school_student" && user.role !== "university_student") {
      throw new Error("Only learner accounts can post projects");
    }

    const requesterType = user.role === "parent" ? "parent" : user.role;

    return await ctx.db.insert("projects", {
      requesterId: user._id,
      requesterType,
      title: args.title,
      description: args.description,
      subject: args.subject,
      deadline: args.deadline,
      budgetMin: args.budgetMin,
      budgetMax: args.budgetMax,
      isRemote: args.isRemote,
      serviceMode: args.serviceMode,
      city: args.city,
      grade: args.grade,
      childId: args.childId,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const acceptProposal = mutation({
  args: {
    projectId: v.id("projects"),
    proposalId: v.id("proposals"),
  },
  handler: async (ctx, { projectId, proposalId }) => {
    const user = await getAuthedUser(ctx);
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.requesterId !== user._id) throw new Error("Only project owner can accept bids");
    if (project.status !== "open") throw new Error("Project is not open for bidding");

    const proposal = await ctx.db.get(proposalId);
    if (!proposal || proposal.projectId !== projectId) throw new Error("Proposal not found for this project");

    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    for (const p of proposals) {
      await ctx.db.patch(p._id, {
        status: p._id === proposalId ? "accepted" : "rejected",
      });
    }

    await ctx.db.patch(projectId, {
      acceptedProposalId: proposalId,
      acceptedFreelancerId: proposal.freelancerId,
      status: "in_progress",
    });

    const sessionId = await ctx.db.insert("sessions", {
      projectId,
      freelancerId: proposal.freelancerId,
      requesterId: project.requesterId,
      status: "accepted",
      sessionType: project.isRemote ? "virtual" : "in_person",
      copilotConsentGiven: false,
      sessionTranscriptChunks: [],
      createdAt: Date.now(),
    });

    return { projectId, proposalId, sessionId };
  },
});

export const completeProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    const user = await getAuthedUser(ctx);
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.requesterId !== user._id) throw new Error("Only project owner can accept completed work");
    if (project.status !== "in_progress") throw new Error("Project must be in progress to complete");

    await ctx.db.patch(projectId, {
      status: "completed",
    });

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .first();

    if (session && session.status !== "completed" && session.status !== "rated") {
      await ctx.db.patch(session._id, {
        status: "completed",
        endedAt: Date.now(),
      });
    }

    return { projectId, status: "completed" as const };
  },
});
