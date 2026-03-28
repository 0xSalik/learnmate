"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OpportunityFeedCard } from "@/components/freelancer/OpportunityFeedCard";
import { ProjectCard } from "@/components/project/ProjectCard";

export default function FreelancerDashboardPage() {
    const me = useQuery(api.users.getCurrentUser);
    const openProjects = useQuery(api.projects.listOpen) ?? [];
    const opportunities = useQuery(
        api.opportunities.byCurrentFreelancer,
        me?.role === "freelancer" ? {} : "skip"
    ) ?? [];

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
                    {opportunities.map((opportunity) => (
                        <OpportunityFeedCard
                            key={opportunity._id}
                            opportunity={{
                                id: String(opportunity._id),
                                freelancerId: String(opportunity.freelancerId),
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
