import { SessionCoPilotSidebar } from "@/components/freelancer/SessionCoPilotSidebar";
import { LearningDNACard } from "@/components/learning/LearningDNACard";
import { children } from "@/lib/mock-data";

export default function SessionPage() {
    return (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-(--border-subtle) bg-white p-5">
                <h1 className="text-2xl font-semibold text-(--text-primary)">Session in progress</h1>
                <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="rounded-full bg-(--surface-warm) px-2 py-1">pending</span>
                    <span className="rounded-full bg-(--brand-primary)/20 px-2 py-1">in_progress</span>
                    <span className="rounded-full bg-(--surface-warm) px-2 py-1">completed</span>
                </div>
                <button className="mt-4 rounded-xl bg-(--brand-secondary) px-4 py-2 text-white">Start Session</button>
                <textarea className="mt-4 h-48 w-full rounded-xl border border-(--border-subtle) p-3" placeholder="Running session notes autosave every 30s" />
            </section>
            <div className="space-y-4">
                <SessionCoPilotSidebar />
                <LearningDNACard child={children[0]} />
            </div>
        </div>
    );
}
