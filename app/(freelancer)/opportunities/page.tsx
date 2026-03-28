import { OpportunityFeedCard } from "@/components/freelancer/OpportunityFeedCard";
import { opportunities } from "@/lib/mock-data";

export default function OpportunitiesPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-(--text-primary)">Your Opportunity Hub</h1>
            <p className="text-sm text-(--text-secondary)">Last refreshed today at 06:00 IST.</p>
            <div className="grid gap-4 md:grid-cols-2">
                {opportunities.map((opportunity) => (
                    <OpportunityFeedCard key={opportunity.id} opportunity={opportunity} />
                ))}
            </div>
        </div>
    );
}
