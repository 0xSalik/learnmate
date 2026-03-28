import type { GroupSession, User } from "@/lib/types";
import { formatInr } from "@/lib/utils";

export function CrashCourseCard({ session, freelancer }: { session: GroupSession; freelancer?: User }) {
    const seatsLeft = session.maxSeats - session.filledSeats;
    return (
        <article className="rounded-2xl border border-(--border-subtle) bg-white p-4">
            <p className="text-xs text-(--text-secondary)">{session.subjectArea}</p>
            <h3 className="mt-1 text-lg font-semibold text-(--text-primary)">{session.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-(--text-secondary)">{session.description}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <p className="rounded-lg bg-(--surface-warm) p-2 text-center">{session.durationMinutes} min</p>
                <p className="rounded-lg bg-(--surface-warm) p-2 text-center">{formatInr(session.pricePerSeat)}</p>
                <p className={`rounded-lg p-2 text-center ${seatsLeft <= 3 ? "bg-(--warning)/20 text-(--warning)" : "bg-(--surface-warm)"}`}>
                    {seatsLeft} seats left
                </p>
            </div>
            <p className="mt-3 text-sm text-(--text-secondary)">
                with {freelancer?.name ?? "Freelancer"} {freelancer?.rating ? `• ★ ${freelancer.rating}` : ""}
            </p>
            <button className="mt-3 w-full rounded-xl bg-(--brand-primary) px-4 py-2 text-sm font-medium text-white">
                Join Class
            </button>
        </article>
    );
}
