"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ProjectCard } from "@/components/project/ProjectCard";
import { api } from "@/convex/_generated/api";

export default function StudentDashboardPage() {
    const profile = useQuery(api.learningDNA.byCurrentStudent);
    const openProjects = useQuery(api.projects.listOpen) ?? [];
    const updateDNA = useMutation(api.learningDNA.updateCurrentStudentDNA);

    const [attentionSpan, setAttentionSpan] = useState<"short" | "medium" | "long">("medium");
    const [explanationStyle, setExplanationStyle] = useState<"visual" | "verbal" | "hands_on" | "mixed">("mixed");
    const [encouragementNeeds, setEncouragementNeeds] = useState<"high" | "medium" | "low">("medium");
    const [confusionTriggers, setConfusionTriggers] = useState("");
    const [interestSignals, setInterestSignals] = useState("");
    const [strongSubjects, setStrongSubjects] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const syncFromProfile = () => {
        if (!profile?.dna) return;
        setAttentionSpan(profile.dna.attentionSpan);
        setExplanationStyle(profile.dna.explanationStyle);
        setEncouragementNeeds(profile.dna.encouragementNeeds);
        setConfusionTriggers(profile.dna.confusionTriggers.join(", "));
        setInterestSignals(profile.dna.interestSignals.join(", "));
        setStrongSubjects(profile.dna.strongSubjects.join(", "));
    };

    const saveDna = async () => {
        setSaveMessage(null);
        setSaving(true);
        try {
            await updateDNA({
                attentionSpan,
                explanationStyle,
                encouragementNeeds,
                confusionTriggers: confusionTriggers.split(",").map((v) => v.trim()).filter(Boolean),
                interestSignals: interestSignals.split(",").map((v) => v.trim()).filter(Boolean),
                strongSubjects: strongSubjects.split(",").map((v) => v.trim()).filter(Boolean),
            });
            setSaveMessage("Learning DNA saved.");
        } catch {
            setSaveMessage("Could not save Learning DNA.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-text-primary">Student Dashboard</h1>

            <section className="rounded-2xl border border-border-subtle bg-white p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">My Learning DNA</h2>
                    <button
                        type="button"
                        onClick={syncFromProfile}
                        className="rounded-lg border border-border-subtle px-3 py-1 text-sm"
                    >
                        Load current profile
                    </button>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-text-secondary">
                        Attention span
                        <select
                            value={attentionSpan}
                            onChange={(e) => setAttentionSpan(e.target.value as "short" | "medium" | "long")}
                            className="mt-1 w-full rounded-lg border border-border-subtle px-3 py-2 text-text-primary"
                        >
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="long">Long</option>
                        </select>
                    </label>

                    <label className="text-sm text-text-secondary">
                        Explanation style
                        <select
                            value={explanationStyle}
                            onChange={(e) => setExplanationStyle(e.target.value as "visual" | "verbal" | "hands_on" | "mixed")}
                            className="mt-1 w-full rounded-lg border border-border-subtle px-3 py-2 text-text-primary"
                        >
                            <option value="visual">Visual</option>
                            <option value="verbal">Verbal</option>
                            <option value="hands_on">Hands-on</option>
                            <option value="mixed">Mixed</option>
                        </select>
                    </label>

                    <label className="text-sm text-text-secondary">
                        Encouragement needs
                        <select
                            value={encouragementNeeds}
                            onChange={(e) => setEncouragementNeeds(e.target.value as "high" | "medium" | "low")}
                            className="mt-1 w-full rounded-lg border border-border-subtle px-3 py-2 text-text-primary"
                        >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </label>

                    <label className="text-sm text-text-secondary">
                        Strong subjects (comma separated)
                        <input
                            value={strongSubjects}
                            onChange={(e) => setStrongSubjects(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-border-subtle px-3 py-2 text-text-primary"
                        />
                    </label>

                    <label className="text-sm text-text-secondary md:col-span-2">
                        Confusion triggers (comma separated)
                        <input
                            value={confusionTriggers}
                            onChange={(e) => setConfusionTriggers(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-border-subtle px-3 py-2 text-text-primary"
                        />
                    </label>

                    <label className="text-sm text-text-secondary md:col-span-2">
                        Interest signals (comma separated)
                        <input
                            value={interestSignals}
                            onChange={(e) => setInterestSignals(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-border-subtle px-3 py-2 text-text-primary"
                        />
                    </label>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            void saveDna();
                        }}
                        disabled={saving}
                        className="rounded-lg bg-brand-primary px-3 py-2 text-sm text-white"
                    >
                        {saving ? "Saving..." : "Save Learning DNA"}
                    </button>
                    {saveMessage ? <p className="text-sm text-text-secondary">{saveMessage}</p> : null}
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
                {openProjects.slice(0, 6).map((project) => (
                    <ProjectCard key={project._id} project={project} proposalCount={0} />
                ))}
            </div>
        </div>
    );
}
