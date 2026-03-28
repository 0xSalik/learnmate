"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OpportunityFeedCard } from "@/components/freelancer/OpportunityFeedCard";
import { ProjectCard } from "@/components/project/ProjectCard";

export default function FreelancerDashboardPage() {
    const openProjects = useQuery(api.projects.listOpen) ?? [];
    const opportunities = useQuery(api.opportunities.byCurrentFreelancer) ?? [];

    return (
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
    );
}
