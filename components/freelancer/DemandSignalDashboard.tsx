"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DemandSignalDashboard() {
    const [status, setStatus] = useState<string | null>(null);
    const [triggering, setTriggering] = useState(false);
    const [fallbackSignals, setFallbackSignals] = useState<any[]>([]);
    const demandSignals = useQuery(api.demandSignals.topByRequestCount, { limit: 12 }) ?? [];
    const displaySignals = fallbackSignals.length ? fallbackSignals : demandSignals;

    const triggerApify = async () => {
        try {
            setTriggering(true);
            setStatus(null);
            setFallbackSignals([]);
            const res = await fetch("/api/apify/trigger", { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                setStatus(data?.message ?? "Could not trigger Apify right now.");
                if (Array.isArray(data?.generatedSignals)) {
                    setFallbackSignals(data.generatedSignals);
                }
                return;
            }

            if (data?.status === "failed") {
                setStatus(`Apify fallback used. ${data?.message ?? "Please verify APIFY_TOKEN/APIFY_ACTOR_ID."}`);
                if (Array.isArray(data?.generatedSignals)) {
                    setFallbackSignals(data.generatedSignals);
                }
                return;
            }

            setStatus(`Apify triggered. Task: ${data.taskId ?? "unknown"}`);
        } catch {
            setStatus("Could not trigger Apify right now.");
        } finally {
            setTriggering(false);
        }
    };

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            try {
                const res = await fetch("/api/apify/trigger", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ fallbackOnly: true }),
                });
                const data = await res.json();
                if (!cancelled && Array.isArray(data?.generatedSignals)) {
                    setFallbackSignals(data.generatedSignals);
                }
            } catch {
                // Keep Convex demand signals as silent fallback.
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-semibold text-text-primary">Demand Signals</h1>
                <button
                    type="button"
                    disabled={triggering}
                    onClick={() => {
                        void triggerApify();
                    }}
                    className="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary disabled:opacity-60"
                >
                    {triggering ? "Triggering..." : "Run Apify Benchmarks"}
                </button>
            </div>
            {status ? <p className="text-sm text-text-secondary">{status}</p> : null}
            <div className="grid gap-3 md:grid-cols-3">
                {displaySignals.slice(0, 8).map((item) => (
                    <article
                        key={item.topic}
                        className={`rounded-2xl border p-4 ${item.trendDirection === "rising"
                            ? "border-warning bg-warning/10"
                            : "border-border-subtle bg-white"
                            }`}
                    >
                        <p className="text-xs text-text-secondary">{item.subjectArea}</p>
                        <h3 className="mt-1 line-clamp-2 font-semibold text-text-primary">{item.topic}</h3>
                        <div className="mt-2 flex items-center justify-between text-sm text-text-secondary">
                            <span>{item.requestCount7d} / 7d</span>
                            <span>₹{item.avgBudgetOffered}</span>
                        </div>
                        {item.trendDirection === "rising" ? (
                            <span className="mt-2 inline-flex rounded-full bg-warning/20 px-2 py-1 text-xs text-warning">🔥 Rising</span>
                        ) : (
                            <span className="mt-2 inline-flex rounded-full bg-surface-warm px-2 py-1 text-xs text-text-secondary">
                                {item.trendDirection}
                            </span>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
