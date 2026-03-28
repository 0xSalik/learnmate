"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { LearningDNACard } from "@/components/learning/LearningDNACard";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function ChildDnaPage() {
    const params = useParams<{ childId: string }>();
    const childId = params.childId as Id<"children">;

    const child = useQuery(api.children.byIdForCurrentUser, { childId });
    const dna = useQuery(api.learningDNA.byChild, { childId });

    if (child === undefined || dna === undefined) {
        return <p className="text-sm text-text-secondary">Loading learning profile...</p>;
    }

    if (!child) {
        return <p className="text-sm text-text-secondary">Child profile not found for this account.</p>;
    }

    if (!dna) {
        return (
            <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-text-primary">{child.name}&apos;s Learning Profile</h1>
                <p className="text-sm text-text-secondary">No learning DNA is available yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-text-primary">{child.name}&apos;s Learning Profile</h1>
            <LearningDNACard child={{
                id: child._id,
                parentId: child.parentId,
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
            }} />
        </div>
    );
}
