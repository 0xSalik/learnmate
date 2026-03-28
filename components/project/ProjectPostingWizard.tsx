"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { formatInr } from "@/lib/utils";
import { api } from "@/convex/_generated/api";

const modes = [
    { key: "guided_session", title: "Guided Session", desc: "Child builds while freelancer guides." },
    { key: "accompanied_build", title: "Accompanied Build", desc: "Build together with checkpoints." },
    { key: "full_build", title: "Full Build", desc: "Freelancer builds and explains transferably." },
] as const;

export function ProjectPostingWizard() {
    const router = useRouter();
    const createProject = useMutation(api.projects.createForCurrentUser);

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("Science");
    const [description, setDescription] = useState("");
    const [grade, setGrade] = useState("");
    const [city, setCity] = useState("");
    const [deadline, setDeadline] = useState("");
    const [isRemote, setIsRemote] = useState(true);
    const [budget, setBudget] = useState(400);
    const [serviceMode, setServiceMode] = useState<(typeof modes)[number]["key"]>("guided_session");
    const [aiData, setAiData] = useState<{ title: string; subject: string; grade: string; confidence: number } | null>(null);
    const [priceSuggestion, setPriceSuggestion] = useState<{ min: number; max: number; reasoning: string } | null>(null);
    const [isGettingPrice, setIsGettingPrice] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState<string | null>(null);

    const priceHint = useMemo(() => {
        const min = Math.max(200, budget - 100);
        const max = budget + 120;
        return `Freelancers in Mumbai charge ${formatInr(min)}–${formatInr(max)} for similar projects.`;
    }, [budget]);

    async function extractBrief() {
        const res = await fetch("/api/ai/extract-brief", { method: "POST" });
        const data = await res.json();
        setAiData(data);
        setTitle(data.title ?? "");
        setSubject(data.subject ?? "Science");
        if (data.grade) setGrade(String(data.grade));
    }

    async function suggestPriceWithAi() {
        try {
            setIsGettingPrice(true);
            const res = await fetch("/api/ai/suggest-price", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    title,
                    subject,
                    city,
                    serviceMode,
                    complexity: aiData?.confidence && aiData.confidence > 0.85 ? "high" : "medium",
                    estimatedHours: serviceMode === "full_build" ? 5 : serviceMode === "accompanied_build" ? 4 : 3,
                }),
            });
            const data = await res.json();
            const min = Number(data.min ?? 300);
            const max = Number(data.max ?? min + 300);
            setPriceSuggestion({
                min,
                max,
                reasoning: data.reasoning ?? "AI-assisted estimate",
            });
            setBudget(Math.round((min + max) / 2));
        } finally {
            setIsGettingPrice(false);
        }
    }

    async function postProject() {
        setPostError(null);
        setIsPosting(true);

        try {
            const parsedDeadline = deadline ? new Date(deadline).getTime() : Date.now() + 3 * 24 * 60 * 60 * 1000;
            const budgetMin = Math.max(200, budget - 120);
            const budgetMax = Math.max(budgetMin + 50, budget + 120);

            const projectId = await createProject({
                title: title.trim() || "Learning support request",
                subject: subject.trim() || "General",
                description: description.trim() || "Need concept clarity and guided support.",
                deadline: parsedDeadline,
                budgetMin,
                budgetMax,
                isRemote,
                serviceMode,
                city: city.trim() || undefined,
                grade: grade.trim() || undefined,
            });

            router.push(`/projects/${projectId}`);
        } catch {
            setPostError("Could not post project. Please ensure you are logged in as parent or student.");
        } finally {
            setIsPosting(false);
        }
    }

    return (
        <div className="rounded-3xl border border-border-subtle bg-white p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary">Project Posting Wizard</h2>
                <span className="text-sm text-text-secondary">Step {step} of 4</span>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={extractBrief}
                        className="w-full rounded-2xl border border-dashed border-brand-primary bg-surface-card px-4 py-10 text-sm text-text-secondary"
                    >
                        Got a printed brief from school? Tap to simulate AI extraction.
                    </button>
                    {aiData ? (
                        <div className="rounded-xl bg-surface-warm p-3 text-sm text-text-secondary">
                            AI extracted with {Math.round(aiData.confidence * 100)}% confidence.
                        </div>
                    ) : null}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-3">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Project title"
                        className="w-full rounded-xl border border-border-subtle px-3 py-2"
                    />
                    <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject"
                        className="w-full rounded-xl border border-border-subtle px-3 py-2"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what the learner finds hard"
                        className="h-28 w-full rounded-xl border border-border-subtle px-3 py-2"
                    />
                    <div className="grid gap-3 md:grid-cols-3">
                        <input
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            placeholder="Grade/Class"
                            className="w-full rounded-xl border border-border-subtle px-3 py-2"
                        />
                        <input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            className="w-full rounded-xl border border-border-subtle px-3 py-2"
                        />
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full rounded-xl border border-border-subtle px-3 py-2"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                        <input
                            checked={isRemote}
                            onChange={(e) => setIsRemote(e.target.checked)}
                            type="checkbox"
                        />
                        Remote sessions allowed
                    </label>
                    <div className="grid gap-3 md:grid-cols-3">
                        {modes.map((mode) => (
                            <button
                                key={mode.key}
                                type="button"
                                onClick={() => setServiceMode(mode.key)}
                                className={`rounded-xl border p-3 text-left ${serviceMode === mode.key
                                    ? "border-brand-primary bg-brand-primary/10"
                                    : "border-border-subtle"
                                    }`}
                            >
                                <p className="font-medium text-text-primary">{mode.title}</p>
                                <p className="text-xs text-text-secondary">{mode.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-3">
                    <label className="text-sm text-text-secondary">Budget: {formatInr(budget)}</label>
                    <button
                        type="button"
                        onClick={() => {
                            void suggestPriceWithAi();
                        }}
                        disabled={isGettingPrice}
                        className="rounded-lg border border-border-subtle px-3 py-1.5 text-sm text-text-primary disabled:opacity-60"
                    >
                        {isGettingPrice ? "Thinking..." : "Suggest Price with AI"}
                    </button>
                    <input
                        value={budget}
                        min={200}
                        max={2000}
                        step={50}
                        type="range"
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full"
                    />
                    <p className="rounded-xl bg-surface-warm p-3 text-sm text-text-secondary">{priceHint}</p>
                    {priceSuggestion ? (
                        <p className="rounded-xl border border-border-subtle bg-white p-3 text-sm text-text-secondary">
                            AI suggests {formatInr(priceSuggestion.min)} – {formatInr(priceSuggestion.max)}. {priceSuggestion.reasoning}
                        </p>
                    ) : null}
                </div>
            )}

            {step === 4 && (
                <div className="space-y-3 rounded-xl bg-surface-warm p-4 text-sm">
                    <p>
                        <span className="text-text-secondary">Title:</span> {title || "Solar system model"}
                    </p>
                    <p>
                        <span className="text-text-secondary">Subject:</span> {subject}
                    </p>
                    <p>
                        <span className="text-text-secondary">Mode:</span> {serviceMode}
                    </p>
                    <p>
                        <span className="text-text-secondary">Budget:</span> {formatInr(budget)}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            void postProject();
                        }}
                        disabled={isPosting}
                        className="mt-2 w-full rounded-xl bg-brand-primary px-4 py-2 font-medium text-white disabled:opacity-50"
                    >
                        {isPosting ? "Posting..." : "Post Project"}
                    </button>
                    {postError ? <p className="text-xs text-red-600">{postError}</p> : null}
                </div>
            )}

            <div className="mt-5 flex gap-2">
                <button
                    type="button"
                    disabled={step === 1 || isPosting}
                    onClick={() => setStep((v) => Math.max(1, v - 1))}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-sm disabled:opacity-40"
                >
                    Back
                </button>
                <button
                    type="button"
                    disabled={step === 4 || isPosting}
                    onClick={() => setStep((v) => Math.min(4, v + 1))}
                    className="rounded-xl bg-text-primary px-4 py-2 text-sm text-white disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
