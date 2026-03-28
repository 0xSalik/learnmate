"use client";

import { useState } from "react";

export function SessionCoPilotSidebar() {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>([]);

    async function submit() {
        const res = await fetch("/api/ai/copilot-stream", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                sessionId: "demo",
                transcriptChunks: [input],
                childDNA: null,
            }),
        });
        const raw = await res.text();
        const text = raw
            .replace(/^data:\s*/gm, "")
            .replace(/\n\n/g, "\n")
            .trim();
        setHistory((prev) => [text || "Check understanding before moving forward.", ...prev].slice(0, 5));
        setInput("");
    }

    return (
        <aside className="rounded-2xl border border-border-subtle bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-success" />
                <h3 className="font-semibold text-text-primary">AI Co-Pilot</h3>
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Child got confused at fractions step..."
                className="h-24 w-full rounded-xl border border-border-subtle p-2 text-sm"
            />
            <button
                type="button"
                onClick={submit}
                className="mt-2 w-full rounded-xl bg-brand-primary px-3 py-2 text-sm font-medium text-white"
            >
                Get whisper suggestion
            </button>
            <div className="mt-3 space-y-2">
                {history.map((item, index) => (
                    <p key={index} className="rounded-lg bg-surface-warm p-2 text-sm text-text-secondary">
                        {item}
                    </p>
                ))}
            </div>
        </aside>
    );
}
