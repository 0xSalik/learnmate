"use client";

import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { Proposal, User } from "@/lib/types";
import { formatInr } from "@/lib/utils";

type Props = {
    proposal: Proposal | Doc<"proposals">;
    freelancer: User | Doc<"users">;
    recommended?: boolean;
    canAccept?: boolean;
    isAccepting?: boolean;
    onAccept?: (proposalId: Id<"proposals">) => void;
};

export function ProposalCard({ proposal, freelancer, recommended, canAccept, isAccepting, onAccept }: Props) {
    const proposalId = "_id" in proposal ? proposal._id : (proposal.id as Id<"proposals">);

    return (
        <article className="rounded-2xl border border-border-subtle bg-white p-4">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-primary">{freelancer.name}</p>
                        <span className="text-sm text-text-secondary">★ {freelancer.rating?.toFixed(1)}</span>
                        {freelancer.studentIdVerified ? (
                            <span className="rounded-full bg-brand-secondary/15 px-2 py-0.5 text-xs text-brand-secondary">
                                Verified
                            </span>
                        ) : null}
                        {recommended ? (
                            <span className="rounded-full bg-brand-primary/15 px-2 py-0.5 text-xs text-brand-primary">
                                Recommended
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{proposal.approach}</p>
                </div>
                <p className="font-semibold text-text-primary">{formatInr(proposal.price)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                <span>{proposal.availability}</span>
                <span>{proposal.estimatedDuration}</span>
            </div>
            {canAccept ? (
                <button
                    type="button"
                    disabled={isAccepting}
                    onClick={() => onAccept?.(proposalId)}
                    className="mt-3 w-full rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                    {isAccepting ? "Accepting..." : "Accept Bid"}
                </button>
            ) : null}
        </article>
    );
}
