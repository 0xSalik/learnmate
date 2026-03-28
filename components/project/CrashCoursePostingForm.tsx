"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CrashCoursePostingForm() {
    const [description, setDescription] = useState("");
    const [topic, setTopic] = useState("");
    const [subjectArea, setSubjectArea] = useState("Financial Accounting");
    const [budget, setBudget] = useState(450);
    const [estimatedDepth, setEstimatedDepth] = useState<"introductory" | "intermediate" | "advanced">("intermediate");
    const [guardrail, setGuardrail] = useState<null | { intent?: string; confidence?: number; isTooAssignmentSpecific: boolean; rephrased?: string }>(null);
    const [status, setStatus] = useState<string | null>(null);

    const createRequest = useMutation(api.crashCourses.createForCurrentUser);

    async function classifyIntent(nextDescription: string) {
        const res = await fetch("/api/ai/classify-intent", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ description: nextDescription, subject: subjectArea }),
        });
        const data = await res.json();
        setGuardrail(data);
    }

    async function submitRequest() {
        setStatus(null);
        try {
            await createRequest({
                topic: topic.trim() || "General concept support",
                subjectArea: subjectArea.trim() || "General",
                description: description.trim() || "Need concept-focused clarity.",
                estimatedDepth,
                preferredFormat: "either",
                budgetPerSession: budget,
                isRemote: true,
                intentClassification: guardrail
                    ? {
                        intent: guardrail.intent ?? "concept_learning",
                        isTooAssignmentSpecific: guardrail.isTooAssignmentSpecific,
                        confidence: guardrail.confidence ?? 0.7,
                    }
                    : undefined,
            });
            setStatus("Crash course request posted.");
            setDescription("");
        } catch {
            setStatus("Could not post request. Please sign in as student.");
        }
    }

    return (
        <div className="rounded-2xl border border-border-subtle bg-white p-5">
            <h2 className="text-xl font-semibold text-text-primary">Post a Crash Course Request</h2>
            <div className="mt-4 space-y-3">
                <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Topic"
                    className="w-full rounded-xl border border-border-subtle px-3 py-2"
                />
                <input
                    value={subjectArea}
                    onChange={(e) => setSubjectArea(e.target.value)}
                    placeholder="Subject area"
                    className="w-full rounded-xl border border-border-subtle px-3 py-2"
                />
                <div className="grid gap-2 md:grid-cols-2">
                    <select
                        value={estimatedDepth}
                        onChange={(e) => setEstimatedDepth(e.target.value as "introductory" | "intermediate" | "advanced")}
                        className="w-full rounded-xl border border-border-subtle px-3 py-2"
                    >
                        <option value="introductory">Introductory</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <input
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value || 0))}
                        type="number"
                        min={200}
                        className="w-full rounded-xl border border-border-subtle px-3 py-2"
                        placeholder="Budget per session"
                    />
                </div>
                <textarea
                    value={description}
                    onChange={async (e) => {
                        setDescription(e.target.value);
                        await classifyIntent(e.target.value);
                    }}
                    placeholder="What confuses you? What do you already understand?"
                    className="h-28 w-full rounded-xl border border-border-subtle px-3 py-2"
                />
                {guardrail?.isTooAssignmentSpecific ? (
                    <div className="rounded-xl border border-warning bg-warning/10 p-3 text-sm text-text-secondary">
                        This sounds like a specific question request. Want to reframe as concept learning?
                        <div className="mt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setDescription(guardrail.rephrased ?? description)}
                                className="rounded-lg bg-brand-primary px-3 py-1.5 text-white"
                            >
                                Rephrase with AI
                            </button>
                            <button type="button" className="rounded-lg border border-border-subtle px-3 py-1.5">
                                Continue anyway
                            </button>
                        </div>
                    </div>
                ) : null}
                <button
                    type="button"
                    onClick={() => {
                        void submitRequest();
                    }}
                    className="w-full rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white"
                >
                    Post Request
                </button>
                {status ? <p className="text-sm text-text-secondary">{status}</p> : null}
            </div>
        </div>
    );
}
