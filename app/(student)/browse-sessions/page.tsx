import { CrashCourseCard } from "@/components/freelancer/CrashCourseCard";
import { groupSessions, users } from "@/lib/mock-data";

export default function BrowseSessionsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-(--text-primary)">Browse Group Sessions</h1>
            <div className="grid gap-4 md:grid-cols-2">
                {groupSessions.map((session) => (
                    <CrashCourseCard
                        key={session.id}
                        session={session}
                        freelancer={users.find((u) => u.id === session.freelancerId)}
                    />
                ))}
            </div>
        </div>
    );
}
