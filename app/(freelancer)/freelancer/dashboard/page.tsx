"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OpportunityFeedCard } from "@/components/freelancer/OpportunityFeedCard";
import { ProjectCard } from "@/components/project/ProjectCard";

export default function FreelancerDashboardPage() {
    const [fallbackOpportunities, setFallbackOpportunities] = useState<Array<{
        id: string;
        freelancerId: string;
        title: string;
        url: string;
        category: "gig" | "internship" | "hackathon" | "scholarship" | "competition" | "volunteer";
        aiSummary: string;
        deadline?: string;
        prize?: string;
    }>>([]);

    const me = useQuery(api.users.getCurrentUser);
    const openProjects = useQuery(api.projects.listOpen) ?? [];
    const opportunities = useQuery(
        api.opportunities.byFreelancer,
        me?.role === "freelancer" ? { freelancerId: me._id } : "skip"
    ) ?? [];

    useEffect(() => {
        if (!me || me.role !== "freelancer") return;
        if (opportunities.length > 0) {
            setFallbackOpportunities([]);
            return;
        }

        let cancelled = false;
        void (async () => {
            const res = await fetch("/api/exa/opportunities", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    freelancerId: String(me._id),
                    skills: me.skills ?? [],
                    city: me.city ?? "India",
                }),
            }).catch(() => null);

            if (!res) return;
            const data = await res.json().catch(() => ({}));
            const items = Array.isArray(data?.results)
                ? data.results.slice(0, 6).map((item: any, idx: number) => ({
                    id: String(item?.id ?? `fallback-${idx}`),
                    freelancerId: String(me._id),
                    title: String(item?.title ?? `Opportunity ${idx + 1}`),
                    url: String(item?.url ?? `https://example.com/opportunity/${idx}`),
                    category: ["gig", "internship", "hackathon", "scholarship", "competition", "volunteer"].includes(String(item?.category))
                        ? String(item.category) as "gig" | "internship" | "hackathon" | "scholarship" | "competition" | "volunteer"
                        : "gig",
                    aiSummary: String(item?.aiSummary ?? "Generated fallback opportunity."),
                    deadline: item?.deadline ? String(item.deadline) : undefined,
                    prize: item?.prize ? String(item.prize) : undefined,
                }))
                : [];

            if (!cancelled) {
                setFallbackOpportunities(items);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [me, opportunities.length]);

    const displayedOpportunities = opportunities.length
        ? opportunities.map((opportunity) => ({
            id: String(opportunity._id),
            freelancerId: String(opportunity.freelancerId),
            title: opportunity.title,
            url: opportunity.url,
            category: opportunity.category,
            aiSummary: opportunity.aiSummary,
            deadline: opportunity.deadline,
            prize: opportunity.prize,
        }))
        : fallbackOpportunities;

    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-border-subtle bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-text-primary">Integrations & AI</h2>
                    <span className="text-xs text-text-secondary">Exa · Apify · OpenRouter</span>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <Link href="/opportunities" className="rounded-xl border border-border-subtle bg-surface-card p-3">
                        <p className="font-medium text-text-primary">Exa Opportunity Hub</p>
                        <p className="mt-1 text-sm text-text-secondary">Refresh gigs/internships and store ranked results.</p>
                    </Link>
                    <Link href="/demand" className="rounded-xl border border-border-subtle bg-surface-card p-3">
                        <p className="font-medium text-text-primary">Apify Demand Signals</p>
                        <p className="mt-1 text-sm text-text-secondary">Trigger benchmark scraping and inspect rising topics.</p>
                    </Link>
                    <Link href="/create-group-session" className="rounded-xl border border-border-subtle bg-surface-card p-3">
                        <p className="font-medium text-text-primary">AI Group Class Builder</p>
                        <p className="mt-1 text-sm text-text-secondary">Generate outline/description and publish to Convex.</p>
                    </Link>
                    <Link href="/session/demo" className="rounded-xl border border-border-subtle bg-surface-card p-3">
                        <p className="font-medium text-text-primary">Live Copilot Sidebar</p>
                        <p className="mt-1 text-sm text-text-secondary">Use AI whisper suggestions during session flow.</p>
                    </Link>
                </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
                <section className="space-y-3 lg:col-span-2">
                    <h1 className="text-2xl font-semibold text-text-primary">Active Work</h1>
                    {openProjects.map((project) => (
                        <ProjectCard key={project._id} project={project} proposalCount={0} />
                    ))}
                </section>
                <aside className="space-y-3">
                    <h2 className="text-xl font-semibold text-text-primary">Opportunity Hub</h2>
                    {displayedOpportunities.map((opportunity) => (
                        <OpportunityFeedCard
                            key={opportunity.id}
                            opportunity={{
                                id: opportunity.id,
                                freelancerId: opportunity.freelancerId,
                                title: opportunity.title,
                                url: opportunity.url,
                                category: opportunity.category,
                                aiSummary: opportunity.aiSummary,
                                deadline: opportunity.deadline,
                                prize: opportunity.prize,
                            }}
                        />
                    ))}
                </aside>
            </div>
        </div>
    );
}
