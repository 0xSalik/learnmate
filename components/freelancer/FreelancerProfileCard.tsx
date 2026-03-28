import type { User } from "@/lib/types";
import { formatInr } from "@/lib/utils";

export function FreelancerProfileCard({ freelancer }: { freelancer: User }) {
    return (
        <article className="rounded-2xl border border-(--border-subtle) bg-white p-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-(--text-primary)">{freelancer.name}</h3>
                <span className="text-sm text-(--text-secondary)">★ {freelancer.rating?.toFixed(1)}</span>
            </div>
            <p className="mt-1 text-sm text-(--text-secondary)">{freelancer.university}</p>
            <p className="mt-2 text-sm text-(--text-secondary)">Skills: {freelancer.skills?.join(", ")}</p>
            <p className="mt-3 text-sm font-medium text-(--text-primary)">{formatInr(freelancer.hourlyRate ?? 0)}/hr</p>
        </article>
    );
}
