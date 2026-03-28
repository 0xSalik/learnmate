"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProjectCard } from "@/components/project/ProjectCard";

export default function BrowseProjectsPage() {
    const projects = useQuery(api.projects.listOpen) ?? [];

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
            <h1 className="text-2xl font-semibold text-text-primary">Browse Open Projects</h1>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                ))}
            </div>
        </main>
    );
}
