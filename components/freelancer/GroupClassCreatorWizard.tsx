"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function GroupClassCreatorWizard({ prefillTopic }: { prefillTopic?: string }) {
    const createGroupSession = useMutation(api.groupSessions.createForCurrentUser);

    const [topic, setTopic] = useState(prefillTopic ?? "");
    const [subjectArea, setSubjectArea] = useState("Programming");
    const [description, setDescription] = useState("");
    const [outline, setOutline] = useState<Array<{ segment: string; durationMinutes: number; whatYouWillUnderstand: string }>>([]);
    const [price, setPrice] = useState(299);
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    async function generate() {
        const res = await fetch("/api/ai/compose-group-session", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ topic, subjectArea, depth: "intermediate", durationMinutes: 60 }),
        });
        const data = await res.json();
        setOutline(data.outline ?? []);
        setDescription(data.description ?? "");
        setPrice(data.suggestedPricePerSeat ?? 299);
        setTitle(data.suggestedTitle ?? topic);
    }

    async function publishSession() {
        setStatus(null);
        try {
            await createGroupSession({
                title: title.trim() || `${topic} Masterclass`,
                topic: topic.trim() || "General",
                subjectArea: subjectArea.trim() || "General",
                description: description.trim() || "Outcome-focused learning session.",
                outline: outline.length
                    ? outline
                    : [
                        {
                            segment: "Concept foundations",
                            durationMinutes: 20,
                            whatYouWillUnderstand: "Core mental model",
                        },
                    ],
                scheduledAt: Date.now() + 24 * 60 * 60 * 1000,
                durationMinutes: 60,
                maxSeats: 20,
                pricePerSeat: price,
                isRemote: true,
                aiAssisted: true,
                proofOfLearningEnabled: true,
            });
            setStatus("Group session published.");
        } catch {
            setStatus("Could not publish. Please sign in as freelancer.");
        }
    }

    return (
        <div className="rounded-2xl border border-border-subtle bg-white p-5">
            <h2 className="text-xl font-semibold text-text-primary">Create Group Class</h2>
            <div className="mt-4 space-y-3">
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                <input value={subjectArea} onChange={(e) => setSubjectArea(e.target.value)} placeholder="Subject area" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                <button onClick={generate} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white">
                    Generate session outline
                </button>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Session title" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Outcome-first description" className="h-24 w-full rounded-xl border border-border-subtle px-3 py-2" />
                {outline.length ? (
                    <ul className="space-y-2">
                        {outline.map((item, index) => (
                            <li key={index} className="rounded-lg bg-surface-warm p-3 text-sm text-text-secondary">
                                <strong className="text-text-primary">{item.segment}</strong> · {item.durationMinutes} min — {item.whatYouWillUnderstand}
                            </li>
                        ))}
                    </ul>
                ) : null}
                <label className="text-sm text-text-secondary">Price per seat: ₹{price}</label>
                <input value={price} onChange={(e) => setPrice(Number(e.target.value))} type="range" min={99} max={999} step={10} className="w-full" />
                <button
                    type="button"
                    onClick={() => {
                        void publishSession();
                    }}
                    className="w-full rounded-xl bg-brand-secondary px-4 py-2 text-sm font-medium text-white"
                >
                    Publish Group Session
                </button>
                {status ? <p className="text-sm text-text-secondary">{status}</p> : null}
            </div>
        </div>
    );
}
