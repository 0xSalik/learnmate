type Report = {
    what_we_covered: string;
    what_your_child_found_hard: string;
    what_to_reinforce_at_home: string;
    materials_to_buy_for_next_time: string[];
    freelancer_observation: string;
};

export function PostSessionReport({ report }: { report: Report }) {
    return (
        <article className="rounded-2xl border border-(--border-subtle) bg-white p-4">
            <h3 className="text-lg font-semibold text-(--text-primary)">Post-session handoff</h3>
            <div className="mt-3 space-y-2 text-sm text-(--text-secondary)">
                <p><strong className="text-(--text-primary)">What we covered:</strong> {report.what_we_covered}</p>
                <p><strong className="text-(--text-primary)">What was hard:</strong> {report.what_your_child_found_hard}</p>
                <p><strong className="text-(--text-primary)">Reinforce at home:</strong> {report.what_to_reinforce_at_home}</p>
                <p><strong className="text-(--text-primary)">Materials:</strong> {report.materials_to_buy_for_next_time.join(", ")}</p>
                <p><strong className="text-(--text-primary)">Freelancer observation:</strong> {report.freelancer_observation}</p>
            </div>
        </article>
    );
}
