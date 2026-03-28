"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OpportunityFeedCard } from "@/components/freelancer/OpportunityFeedCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { opportunities } from "@/lib/mock-data";

export default function FreelancerDashboardPage() {
    const openProjects = useQuery(api.projects.listOpen) ?? [];

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
                    <OpportunityFeedCard key={opportunity.id} opportunity={opportunity} />
                ))}
            </aside>
        </div>
    );
}
