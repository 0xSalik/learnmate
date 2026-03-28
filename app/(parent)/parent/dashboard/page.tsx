"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostSessionReport } from "@/components/learning/PostSessionReport";
import { ProjectCard } from "@/components/project/ProjectCard";
import { reportSeed } from "@/lib/mock-data";

export default function ParentDashboardPage() {
    const projects = useQuery(api.projects.listByCurrentUser) ?? [];
    const childrenWithDna = useQuery(api.children.listWithDnaForCurrentUser) ?? [];
    const seedDemoData = useMutation(api.users.seedDemoData);
    const [isSeeding, setIsSeeding] = useState(false);

    const openCount = projects.filter((project) => project.status === "open").length;
    const inProgressCount = projects.filter((project) => project.status === "in_progress").length;
    const completedCount = projects.filter((project) => project.status === "completed").length;

    const runSeed = async () => {
        try {
            setIsSeeding(true);
            await seedDemoData({});
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-semibold text-text-primary">Parent Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Link href="/post-project" className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white">
                        Post Project
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            void runSeed();
                        }}
                        disabled={isSeeding}
                        className="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary disabled:opacity-60"
                    >
                        {isSeeding ? "Seeding..." : "Seed Demo Data"}
                    </button>
                </div>
            </div>

            <section className="grid gap-3 md:grid-cols-4">
                <article className="rounded-xl border border-border-subtle bg-white p-4">
                    <p className="text-xs text-text-secondary">Total Projects</p>
                    <p className="mt-1 text-2xl font-semibold text-text-primary">{projects.length}</p>
                </article>
                <article className="rounded-xl border border-border-subtle bg-white p-4">
                    <p className="text-xs text-text-secondary">Open Bids</p>
                    <p className="mt-1 text-2xl font-semibold text-text-primary">{openCount}</p>
                </article>
                <article className="rounded-xl border border-border-subtle bg-white p-4">
                    <p className="text-xs text-text-secondary">In Progress</p>
                    <p className="mt-1 text-2xl font-semibold text-text-primary">{inProgressCount}</p>
                </article>
                <article className="rounded-xl border border-border-subtle bg-white p-4">
                    <p className="text-xs text-text-secondary">Completed</p>
                    <p className="mt-1 text-2xl font-semibold text-text-primary">{completedCount}</p>
                </article>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                {projects.length ? (
                    projects.map((project) => (
                        <ProjectCard key={project._id} project={project} proposalCount={2} />
                    ))
                ) : (
                    <article className="rounded-2xl border border-dashed border-border-subtle bg-white p-5 md:col-span-2">
                        <h2 className="text-lg font-semibold text-text-primary">No projects yet</h2>
                        <p className="mt-2 text-sm text-text-secondary">
                            Start by posting your first project, or seed end-to-end dummy data for testing.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link href="/post-project" className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white">
                                Post Project
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    void runSeed();
                                }}
                                disabled={isSeeding}
                                className="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary disabled:opacity-60"
                            >
                                {isSeeding ? "Seeding..." : "Seed Demo Data"}
                            </button>
                        </div>
                    </article>
                )}
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold text-text-primary">Child DNA Insights</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    {childrenWithDna.length ? (
                        childrenWithDna.map(({ child, dna }) => (
                            <article key={child._id} className="rounded-2xl border border-border-subtle bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-text-primary">{child.name}</h3>
                                    <span className="rounded-full bg-surface-card px-2 py-1 text-xs text-text-secondary">
                                        {child.grade || "Grade N/A"}
                                    </span>
                                </div>
                                {dna ? (
                                    <div className="mt-3 space-y-2 text-sm text-text-secondary">
                                        <p>
                                            <span className="font-medium text-text-primary">Attention:</span> {dna.attentionSpan}
                                        </p>
                                        <p>
                                            <span className="font-medium text-text-primary">Style:</span> {dna.explanationStyle.replace("_", " ")}
                                        </p>
                                        <p>
                                            <span className="font-medium text-text-primary">Encouragement:</span> {dna.encouragementNeeds}
                                        </p>
                                        <p className="line-clamp-2">
                                            <span className="font-medium text-text-primary">Interest signals:</span>{" "}
                                            {dna.interestSignals.join(", ") || "None yet"}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-text-secondary">No DNA profile yet.</p>
                                )}
                            </article>
                        ))
                    ) : (
                        <article className="rounded-2xl border border-dashed border-border-subtle bg-white p-4 md:col-span-2">
                            <p className="text-sm text-text-secondary">
                                No child profile found for this parent yet. Seed demo data to generate child DNA insights.
                            </p>
                        </article>
                    )}
                </div>
            </section>

            <PostSessionReport report={reportSeed} />
        </div>
    );
}
