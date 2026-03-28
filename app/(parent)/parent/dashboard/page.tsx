"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostSessionReport } from "@/components/learning/PostSessionReport";
import { ProjectCard } from "@/components/project/ProjectCard";
import { reportSeed } from "@/lib/mock-data";

export default function ParentDashboardPage() {
    const projects = useQuery(api.projects.listByCurrentUser) ?? [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text-primary">Parent Dashboard</h1>
            <section className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                    <ProjectCard key={project._id} project={project} proposalCount={2} />
                ))}
            </section>
            <PostSessionReport report={reportSeed} />
        </div>
    );
}
