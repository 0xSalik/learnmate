import { demandSignals } from "@/lib/mock-data";

export function DemandSignalDashboard() {
    return (
        <section className="space-y-5">
            <h1 className="text-2xl font-semibold text-(--text-primary)">Demand Signals</h1>
            <div className="grid gap-3 md:grid-cols-3">
                {demandSignals.slice(0, 8).map((item) => (
                    <article
                        key={item.topic}
                        className={`rounded-2xl border p-4 ${item.trendDirection === "rising"
                                ? "border-(--warning) bg-(--warning)/10"
                                : "border-(--border-subtle) bg-white"
                            }`}
                    >
                        <p className="text-xs text-(--text-secondary)">{item.subjectArea}</p>
                        <h3 className="mt-1 line-clamp-2 font-semibold text-(--text-primary)">{item.topic}</h3>
                        <div className="mt-2 flex items-center justify-between text-sm text-(--text-secondary)">
                            <span>{item.requestCount7d} / 7d</span>
                            <span>₹{item.avgBudgetOffered}</span>
                        </div>
                        {item.trendDirection === "rising" ? (
                            <span className="mt-2 inline-flex rounded-full bg-(--warning)/20 px-2 py-1 text-xs text-(--warning)">🔥 Rising</span>
                        ) : (
                            <span className="mt-2 inline-flex rounded-full bg-(--surface-warm) px-2 py-1 text-xs text-(--text-secondary)">
                                {item.trendDirection}
                            </span>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
