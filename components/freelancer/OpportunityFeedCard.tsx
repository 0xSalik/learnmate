import type { Opportunity } from "@/lib/types";

export function OpportunityFeedCard({ opportunity }: { opportunity: Opportunity }) {
    return (
        <article className="rounded-2xl border border-(--border-subtle) bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-(--surface-card) px-2 py-1 text-xs uppercase text-(--text-secondary)">
                    {opportunity.category}
                </span>
                {opportunity.deadline ? (
                    <span className="text-xs text-(--danger)">{opportunity.deadline}</span>
                ) : null}
            </div>
            <h3 className="text-base font-semibold text-(--text-primary)">{opportunity.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-(--text-secondary)">{opportunity.aiSummary}</p>
            <div className="mt-3 flex items-center justify-between">
                <a href={opportunity.url} target="_blank" className="text-sm font-medium text-(--brand-primary)">
                    Open
                </a>
                {opportunity.prize ? <span className="text-xs text-(--success)">{opportunity.prize}</span> : null}
            </div>
        </article>
    );
}
