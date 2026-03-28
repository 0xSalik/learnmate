"use client";

import { useState } from "react";

export function CrashCoursePostingForm() {
    const [description, setDescription] = useState("");
    const [topic, setTopic] = useState("");
    const [subjectArea, setSubjectArea] = useState("Financial Accounting");
    const [guardrail, setGuardrail] = useState<null | { isTooAssignmentSpecific: boolean; rephrased?: string }>(null);

    async function classifyIntent(nextDescription: string) {
        const res = await fetch("/api/ai/classify-intent", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ description: nextDescription, subject: subjectArea }),
        });
        const data = await res.json();
        setGuardrail(data);
    }

    return (
        <div className="rounded-2xl border border-(--border-subtle) bg-white p-5">
            <h2 className="text-xl font-semibold text-(--text-primary)">Post a Crash Course Request</h2>
            <div className="mt-4 space-y-3">
                <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Topic"
                    className="w-full rounded-xl border border-(--border-subtle) px-3 py-2"
                />
                <input
                    value={subjectArea}
                    onChange={(e) => setSubjectArea(e.target.value)}
                    placeholder="Subject area"
                    className="w-full rounded-xl border border-(--border-subtle) px-3 py-2"
                />
                <textarea
                    value={description}
                    onChange={async (e) => {
                        setDescription(e.target.value);
                        await classifyIntent(e.target.value);
                    }}
                    placeholder="What confuses you? What do you already understand?"
                    className="h-28 w-full rounded-xl border border-(--border-subtle) px-3 py-2"
                />
                {guardrail?.isTooAssignmentSpecific ? (
                    <div className="rounded-xl border border-(--warning) bg-(--warning)/10 p-3 text-sm text-(--text-secondary)">
                        This sounds like a specific question request. Want to reframe as concept learning?
                        <div className="mt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setDescription(guardrail.rephrased ?? description)}
                                className="rounded-lg bg-(--brand-primary) px-3 py-1.5 text-white"
                            >
                                Rephrase with AI
                            </button>
                            <button type="button" className="rounded-lg border border-(--border-subtle) px-3 py-1.5">
                                Continue anyway
                            </button>
                        </div>
                    </div>
                ) : null}
                <button className="w-full rounded-xl bg-(--brand-primary) px-4 py-2 text-sm font-medium text-white">
                    Post Request
                </button>
            </div>
        </div>
    );
}
