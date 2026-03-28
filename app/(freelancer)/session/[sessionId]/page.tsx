"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { SessionCoPilotSidebar } from "@/components/freelancer/SessionCoPilotSidebar";
import { LearningDNACard } from "@/components/learning/LearningDNACard";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const convexIdPattern = /^[a-z0-9]{20,}$/;

export default function SessionPage() {
    const params = useParams<{ sessionId: string }>();
    const sessionId = String(params?.sessionId ?? "");
    const isDemo = sessionId === "demo";
    const isValidConvexId = convexIdPattern.test(sessionId);

    const [demoStatus, setDemoStatus] = useState<"pending" | "in_progress" | "completed">("pending");
    const [notes, setNotes] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);

    const session = useQuery(
        api.sessions.byId,
        !isDemo && isValidConvexId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
    );

    const project = useQuery(
        api.projects.byId,
        session?.projectId ? { id: session.projectId } : "skip"
    );

    const child = useQuery(
        api.children.byIdForCurrentUser,
        project?.childId ? { childId: project.childId } : "skip"
    );

    const dna = useQuery(
        api.learningDNA.byChild,
        child?._id ? { childId: child._id } : "skip"
    );

    const transitionState = useMutation(api.sessions.transitionState);

    const status = isDemo ? demoStatus : (session?.status ?? "pending");

    const childForInsight = useMemo(() => {
        if (!child || !dna) return null;

        return {
            id: String(child._id),
            parentId: String(child.parentId),
            name: child.name,
            grade: child.grade ?? "",
            school: child.school,
            learningDNA: {
                attentionSpan: dna.attentionSpan,
                explanationStyle: dna.explanationStyle,
                confusionTriggers: dna.confusionTriggers,
                encouragementNeeds: dna.encouragementNeeds,
                strongSubjects: dna.strongSubjects,
                interestSignals: dna.interestSignals,
                lastUpdated: dna.lastUpdated,
            },
        };
    }, [child, dna]);

    const startSession = async () => {
        if (isDemo) {
            setDemoStatus("in_progress");
            return;
        }
        if (!isValidConvexId) return;

        try {
            setIsTransitioning(true);
            await transitionState({
                sessionId: sessionId as Id<"sessions">,
                status: "in_progress",
            });
        } finally {
            setIsTransitioning(false);
        }
    };

    const completeSession = async () => {
        if (isDemo) {
            setDemoStatus("completed");
            return;
        }
        if (!isValidConvexId) return;

        try {
            setIsTransitioning(true);
            await transitionState({
                sessionId: sessionId as Id<"sessions">,
                status: "completed",
            });
        } finally {
            setIsTransitioning(false);
        }
    };

    return (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-border-subtle bg-white p-5">
                <h1 className="text-2xl font-semibold text-text-primary">Session control</h1>
                <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className={`rounded-full px-2 py-1 ${status === "pending" ? "bg-brand-primary/20" : "bg-surface-warm"}`}>pending</span>
                    <span className={`rounded-full px-2 py-1 ${status === "in_progress" ? "bg-brand-primary/20" : "bg-surface-warm"}`}>in_progress</span>
                    <span className={`rounded-full px-2 py-1 ${status === "completed" ? "bg-brand-primary/20" : "bg-surface-warm"}`}>completed</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            void startSession();
                        }}
                        disabled={isTransitioning || status === "in_progress" || status === "completed"}
                        className="rounded-xl bg-brand-secondary px-4 py-2 text-white disabled:opacity-50"
                    >
                        {isTransitioning ? "Updating..." : "Start Session"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void completeSession();
                        }}
                        disabled={isTransitioning || status === "completed"}
                        className="rounded-xl border border-border-subtle px-4 py-2 text-text-primary disabled:opacity-50"
                    >
                        Mark Completed
                    </button>
                </div>

                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-4 h-48 w-full rounded-xl border border-border-subtle p-3"
                    placeholder="Running session notes. Paste chunks into AI copilot for next-step guidance."
                />
            </section>

            <div className="space-y-4">
                <SessionCoPilotSidebar />
                {childForInsight ? (
                    <LearningDNACard child={childForInsight} />
                ) : (
                    <div className="rounded-2xl border border-border-subtle bg-white p-4 text-sm text-text-secondary">
                        Learning DNA insights will appear once this session is linked to a child profile.
                    </div>
                )}
            </div>
        </div>
    );
}
