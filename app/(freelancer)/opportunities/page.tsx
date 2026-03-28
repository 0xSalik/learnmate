"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OpportunityFeedCard } from "@/components/freelancer/OpportunityFeedCard";

export default function OpportunitiesPage() {
    const [status, setStatus] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [fallbackItems, setFallbackItems] = useState<Array<{
        id: string;
        freelancerId: string;
        title: string;
        url: string;
        category: "gig" | "internship" | "hackathon" | "scholarship" | "competition" | "volunteer";
        aiSummary: string;
        deadline?: string;
        prize?: string;
    }>>([]);

    const me = useQuery(api.users.getCurrentUser);
    const opportunities = useQuery(
        api.opportunities.byFreelancer,
        me?.role === "freelancer" ? { freelancerId: me._id } : "skip"
    ) ?? [];
    const upsertForCurrentFreelancer = useMutation(api.opportunities.upsertForCurrentFreelancer);

    const normalizeCategory = (value: unknown): "gig" | "internship" | "hackathon" | "scholarship" | "competition" | "volunteer" => {
        const v = String(value ?? "").toLowerCase();
        if (v === "internship" || v === "hackathon" || v === "scholarship" || v === "competition" || v === "volunteer") {
            return v;
        }
        return "gig";
    };

    const asOptionalString = (value: unknown): string | undefined => {
        if (value === null || value === undefined) return undefined;
        const text = String(value).trim();
        return text.length ? text : undefined;
    };

    const refreshFromExa = async () => {
        if (!me || me.role !== "freelancer") {
            setStatus("Sign in as freelancer to refresh opportunities.");
            return;
        }

        try {
            setRefreshing(true);
            setStatus(null);
            setFallbackItems([]);
            const res = await fetch("/api/exa/opportunities", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    freelancerId: String(me._id),
                    skills: me.skills ?? [],
                    city: me.city ?? "India",
                }),
            });
            const data = await res.json();

            const items: Array<{
                title: string;
                url: string;
                description: string;
                aiSummary: string;
                category: "gig" | "internship" | "hackathon" | "scholarship" | "competition" | "volunteer";
                deadline?: string;
                prize?: string;
                relevanceScore: number;
                expiresAt: number;
            }> = (data.results ?? [])
                .map((item: any, idx: number) => ({
                    title: asOptionalString(item.title) ?? `Opportunity ${idx + 1}`,
                    url: asOptionalString(item.url) ?? `https://example.com/opportunity/${Date.now()}-${idx}`,
                    description: asOptionalString(item.description) ?? "",
                    aiSummary: asOptionalString(item.aiSummary) ?? "Relevant opportunity.",
                    category: normalizeCategory(item.category),
                    deadline: asOptionalString(item.deadline),
                    prize: asOptionalString(item.prize),
                    relevanceScore: Number.isFinite(Number(item.relevanceScore)) ? Number(item.relevanceScore) : 0.7,
                    expiresAt: Number.isFinite(Number(item.expiresAt))
                        ? Number(item.expiresAt)
                        : Date.now() + 7 * 24 * 60 * 60 * 1000,
                }))
                .slice(0, 20);

            try {
                await upsertForCurrentFreelancer({
                    items,
                });
                setStatus(
                    data?.mode === "fallback"
                        ? `Exa fallback used (${data?.source ?? "openrouter"}). Loaded ${items.length} opportunities.`
                        : `Refreshed ${items.length} opportunities from Exa.`
                );
            } catch {
                setFallbackItems(
                    items.map((item: typeof items[number], idx: number) => ({
                        id: `fallback-${Date.now()}-${idx}`,
                        freelancerId: String(me._id),
                        title: item.title,
                        url: item.url,
                        category: item.category,
                        aiSummary: item.aiSummary,
                        deadline: item.deadline,
                        prize: item.prize,
                    }))
                );
                setStatus(
                    `Saved locally using ${data?.mode === "fallback" ? "OpenRouter fallback" : "API fallback"}. Showing ${items.length} opportunities.`
                );
            }
        } catch {
            setStatus("Could not refresh opportunities right now.");
        } finally {
            setRefreshing(false);
        }
    };

    const displayOpportunities = opportunities.length
        ? opportunities.map((opportunity) => ({
            id: String(opportunity._id),
            freelancerId: String(opportunity.freelancerId),
            title: opportunity.title,
            url: opportunity.url,
            category: opportunity.category,
            aiSummary: opportunity.aiSummary,
            deadline: opportunity.deadline,
            prize: opportunity.prize,
        }))
        : fallbackItems;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-semibold text-text-primary">Your Opportunity Hub</h1>
                <button
                    type="button"
                    disabled={refreshing}
                    onClick={() => {
                        void refreshFromExa();
                    }}
                    className="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary disabled:opacity-60"
                >
                    {refreshing ? "Refreshing..." : "Refresh from Exa"}
                </button>
            </div>
            <p className="text-sm text-text-secondary">AI-ranked opportunities fetched from Exa.</p>
            {status ? <p className="text-sm text-text-secondary">{status}</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
                {displayOpportunities.map((opportunity) => (
                    <OpportunityFeedCard
                        key={opportunity.id}
                        opportunity={{
                            id: opportunity.id,
                            freelancerId: opportunity.freelancerId,
                            title: opportunity.title,
                            url: opportunity.url,
                            category: opportunity.category,
                            aiSummary: opportunity.aiSummary,
                            deadline: opportunity.deadline,
                            prize: opportunity.prize,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
