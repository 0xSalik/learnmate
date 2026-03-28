"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function GroupClassCreatorWizard({ prefillTopic }: { prefillTopic?: string }) {
    const createGroupSession = useMutation(api.groupSessions.createForCurrentUser);

    const [topic, setTopic] = useState(prefillTopic ?? "");
    const [subjectArea, setSubjectArea] = useState("Programming");
    const [depth, setDepth] = useState<"introductory" | "intermediate" | "advanced">("intermediate");
    const [description, setDescription] = useState("");
    const [outline, setOutline] = useState<Array<{ segment: string; durationMinutes: number; whatYouWillUnderstand: string }>>([]);
    const [price, setPrice] = useState(299);
    const [title, setTitle] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [maxSeats, setMaxSeats] = useState(20);
    const [isRemote, setIsRemote] = useState(true);
    const [city, setCity] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [scheduledAt, setScheduledAt] = useState<string>("");
    const [generating, setGenerating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    async function generate() {
        setStatus(null);
        try {
            setGenerating(true);
            const res = await fetch("/api/ai/compose-group-session", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    topic,
                    subjectArea,
                    depth,
                    durationMinutes,
                    benchmarkPrice: price,
                    maxSeats,
                    isRemote,
                }),
            });
            const data = await res.json();
            setOutline(Array.isArray(data.outline) ? data.outline : []);
            setDescription(String(data.description ?? ""));
            setPrice(Number.isFinite(Number(data.suggestedPricePerSeat)) ? Number(data.suggestedPricePerSeat) : 299);
            setTitle(String(data.suggestedTitle ?? topic));
            setStatus("Class plan generated.");
        } catch {
            setStatus("Could not generate class plan right now.");
        } finally {
            setGenerating(false);
        }
    }

    async function publishSession() {
        setStatus(null);
        try {
            setPublishing(true);
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
                scheduledAt: scheduledAt ? new Date(scheduledAt).getTime() : Date.now() + 24 * 60 * 60 * 1000,
                durationMinutes,
                maxSeats,
                pricePerSeat: price,
                isRemote,
                meetingLink: meetingLink.trim() || undefined,
                city: city.trim() || undefined,
                aiAssisted: true,
                proofOfLearningEnabled: true,
            });
            setStatus("Group session published.");
        } catch {
            setStatus("Could not publish. Please sign in as freelancer.");
        } finally {
            setPublishing(false);
        }
    }

    return (
        <div className="rounded-2xl border border-border-subtle bg-white p-5">
            <h2 className="text-xl font-semibold text-text-primary">Create Group Class</h2>
            <div className="mt-4 space-y-3">
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                <input value={subjectArea} onChange={(e) => setSubjectArea(e.target.value)} placeholder="Subject area" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                <select
                    value={depth}
                    onChange={(e) => setDepth(e.target.value as "introductory" | "intermediate" | "advanced")}
                    className="w-full rounded-xl border border-border-subtle px-3 py-2"
                >
                    <option value="introductory">Introductory</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
                <div className="grid gap-3 md:grid-cols-3">
                    <input value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value || 60))} type="number" min={30} max={180} className="w-full rounded-xl border border-border-subtle px-3 py-2" placeholder="Duration (min)" />
                    <input value={maxSeats} onChange={(e) => setMaxSeats(Number(e.target.value || 20))} type="number" min={5} max={200} className="w-full rounded-xl border border-border-subtle px-3 py-2" placeholder="Max seats" />
                    <input value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} type="datetime-local" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                </div>
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                    <input checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} type="checkbox" />
                    Remote class
                </label>
                <input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="Meeting link (optional)" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (optional for in-person)" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                <button disabled={generating || !topic.trim()} onClick={generate} className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                    {generating ? "Generating..." : "Generate session outline"}
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
                    disabled={publishing || !topic.trim()}
                    className="w-full rounded-xl bg-brand-secondary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                    {publishing ? "Publishing..." : "Publish Group Session"}
                </button>
                {status ? <p className="text-sm text-text-secondary">{status}</p> : null}
            </div>
        </div>
    );
}
