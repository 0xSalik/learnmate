"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Project } from "@/lib/types";
import { deadlineLabel, formatInr } from "@/lib/utils";

type Props = {
    project: Project | {
        _id: Id<"projects">;
        title: string;
        subject: string;
        deadline: number;
        budgetMin: number;
        budgetMax: number;
        serviceMode: "guided_session" | "accompanied_build" | "full_build";
    };
    proposalCount?: number;
};

export function ProjectCard({ project, proposalCount = 0 }: Props) {
    const hasConvexId = "_id" in project;
    const projectId = hasConvexId ? project._id : null;
    const liveCount = useQuery(
        api.proposals.countByProject,
        projectId ? { projectId } : "skip"
    );

    return (
        <Link
            href={projectId ? `/projects/${projectId}` : "#"}
            aria-disabled={!projectId}
            className={`block rounded-2xl border border-border-subtle bg-surface-card p-4 transition hover:shadow-sm ${projectId ? "" : "pointer-events-none opacity-70"
                }`}
        >
            <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-white px-2 py-1 text-xs text-text-secondary">
                    {project.subject}
                </span>
                <span className="text-xs text-text-secondary">{deadlineLabel(project.deadline)}</span>
            </div>
            <h3 className="line-clamp-2 text-base font-semibold text-text-primary">{project.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">
                {formatInr(project.budgetMin)}–{formatInr(project.budgetMax)}
            </p>
            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-text-secondary">{project.serviceMode.replace("_", " ")}</span>
                <span className="inline-flex items-center gap-1 text-xs text-brand-primary">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" />
                    {liveCount ?? proposalCount} proposals
                </span>
            </div>
        </Link>
    );
}
