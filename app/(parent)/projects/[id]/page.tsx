"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { LiveProposalFeed } from "@/components/project/LiveProposalFeed";
import { deadlineLabel, formatInr } from "@/lib/utils";

export default function ParentProjectPage({ params }: { params: { id: string } }) {
    const projectId = params.id as Id<"projects">;
    const project = useQuery(api.projects.byId, { id: projectId });
    const currentUser = useQuery(api.users.getCurrentUser);
    const placeBid = useMutation(api.proposals.createForCurrentUser);
    const completeProject = useMutation(api.projects.completeProject);

    const [price, setPrice] = useState(800);
    const [approach, setApproach] = useState("I will break this into easy milestones and share updates daily.");
    const [availability, setAvailability] = useState("Evenings + weekend");
    const [estimatedDuration, setEstimatedDuration] = useState("3 days");
    const [isSubmittingBid, setIsSubmittingBid] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    if (project === undefined || currentUser === undefined) {
        return <div className="p-4 text-text-secondary">Loading project...</div>;
    }

    if (!project) {
        return <div className="p-4 text-red-600">Project not found.</div>;
    }

    const isOwner = !!currentUser && currentUser._id === project.requesterId;
    const canBid = !!currentUser && currentUser.role === "freelancer" && project.status === "open";

    const submitBid = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canBid) return;

        try {
            setIsSubmittingBid(true);
            await placeBid({
                projectId,
                price,
                approach,
                availability,
                estimatedDuration,
            });
        } finally {
            setIsSubmittingBid(false);
        }
    };

    const acceptCompletedWork = async () => {
        if (!isOwner || project.status !== "in_progress") return;
        try {
            setIsCompleting(true);
            await completeProject({ projectId });
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            <section className="rounded-2xl border border-border-subtle bg-white p-5">
                <h1 className="text-2xl font-semibold text-text-primary">{project.title}</h1>
                <p className="mt-2 text-text-secondary">{project.description}</p>
                <div className="mt-4 grid gap-2 text-sm text-text-secondary">
                    <p>Deadline: {deadlineLabel(project.deadline)}</p>
                    <p>Budget: {formatInr(project.budgetMin)} - {formatInr(project.budgetMax)}</p>
                    <p>Service mode: {project.serviceMode.replace("_", " ")}</p>
                    <p>Status: {project.status.replace("_", " ")}</p>
                </div>

                {canBid ? (
                    <form onSubmit={submitBid} className="mt-6 space-y-3 rounded-xl border border-border-subtle bg-surface-card p-4">
                        <h2 className="text-lg font-semibold text-text-primary">Place your bid</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            <label className="space-y-1 text-sm text-text-secondary">
                                <span>Price (₹)</span>
                                <input
                                    type="number"
                                    min={100}
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="w-full rounded-lg border border-border-subtle px-3 py-2"
                                />
                            </label>
                            <label className="space-y-1 text-sm text-text-secondary">
                                <span>Estimated duration</span>
                                <input
                                    value={estimatedDuration}
                                    onChange={(e) => setEstimatedDuration(e.target.value)}
                                    className="w-full rounded-lg border border-border-subtle px-3 py-2"
                                />
                            </label>
                        </div>
                        <label className="space-y-1 text-sm text-text-secondary">
                            <span>Availability</span>
                            <input
                                value={availability}
                                onChange={(e) => setAvailability(e.target.value)}
                                className="w-full rounded-lg border border-border-subtle px-3 py-2"
                            />
                        </label>
                        <label className="space-y-1 text-sm text-text-secondary">
                            <span>Your approach</span>
                            <textarea
                                value={approach}
                                onChange={(e) => setApproach(e.target.value)}
                                className="h-24 w-full rounded-lg border border-border-subtle px-3 py-2"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={isSubmittingBid}
                            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {isSubmittingBid ? "Submitting..." : "Submit Bid"}
                        </button>
                    </form>
                ) : null}

                {isOwner && project.status === "in_progress" ? (
                    <div className="mt-6 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-4">
                        <h2 className="text-base font-semibold text-text-primary">Work delivered?</h2>
                        <p className="mt-1 text-sm text-text-secondary">
                            Accept final work to close this project. Payment stays in demo mode.
                        </p>
                        <button
                            type="button"
                            disabled={isCompleting}
                            onClick={acceptCompletedWork}
                            className="mt-3 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {isCompleting ? "Accepting..." : "Accept Work & Complete Project"}
                        </button>
                    </div>
                ) : null}
            </section>
            <LiveProposalFeed
                projectId={project._id}
                suggestedFreelancerIds={(project.suggestedFreelancerIds ?? []).map((id) => String(id))}
                ownerMode={isOwner}
            />
        </div>
    );
}
