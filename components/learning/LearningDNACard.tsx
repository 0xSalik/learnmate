import type { Child } from "@/lib/types";

export function LearningDNACard({ child }: { child: Child }) {
    const dna = child.learningDNA;
    if (!dna) return null;
    return (
        <article className="rounded-2xl border border-(--border-subtle) bg-white p-4">
            <h3 className="text-lg font-semibold text-(--text-primary)">Meet {child.name}</h3>
            <p className="mt-1 text-sm text-(--text-secondary)">
                Learns best through {dna.explanationStyle.replace("_", "-")} examples with {dna.encouragementNeeds} encouragement.
            </p>
            <div className="mt-3 grid gap-2 text-sm">
                <div className="rounded-lg bg-(--surface-warm) p-2">Attention span: {dna.attentionSpan}</div>
                <div className="rounded-lg bg-(--surface-warm) p-2">
                    Confusion triggers: {dna.confusionTriggers.join(", ")}
                </div>
                <div className="rounded-lg bg-(--surface-warm) p-2">
                    Interest signals: {dna.interestSignals.join(", ")}
                </div>
            </div>
        </article>
    );
}
