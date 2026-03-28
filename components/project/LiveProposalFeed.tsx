"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ProposalCard } from "@/components/project/ProposalCard";

export function LiveProposalFeed({
    projectId,
    ownerMode = false,
    suggestedFreelancerIds = [],
}: {
    projectId: Id<"projects">;
    ownerMode?: boolean;
    suggestedFreelancerIds?: string[];
}) {
    const [pulse] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const proposals = useQuery(api.proposals.byProject, { projectId }) ?? [];
    const freelancers = useQuery(api.users.listFreelancers) ?? [];
    const acceptProposal = useMutation(api.projects.acceptProposal);

    const liveProposals = useMemo(
        () => proposals,
        [proposals]
    );

    const onAccept = async (proposalId: Id<"proposals">) => {
        try {
            setAcceptingId(proposalId);
            await acceptProposal({ projectId, proposalId });
        } finally {
            setAcceptingId(null);
        }
    };

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Live Proposals</h3>
                <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                    <span className={`h-2.5 w-2.5 rounded-full bg-brand-primary ${pulse ? "animate-pulse" : ""}`} />
                    {liveProposals.length} live
                </span>
            </div>

            {liveProposals.map((proposal) => {
                const freelancer = freelancers.find((u) => u._id === proposal.freelancerId);
                if (!freelancer) return null;
                return (
                    <ProposalCard
                        key={proposal._id}
                        proposal={proposal}
                        freelancer={freelancer}
                        recommended={suggestedFreelancerIds.includes(String(freelancer._id))}
                        canAccept={ownerMode && proposal.status === "pending"}
                        isAccepting={acceptingId === proposal._id}
                        onAccept={onAccept}
                    />
                );
            })}
        </section>
    );
}
