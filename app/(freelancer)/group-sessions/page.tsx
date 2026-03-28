import { CrashCourseCard } from "@/components/freelancer/CrashCourseCard";
import { groupSessions, users } from "@/lib/mock-data";

export default function FreelancerGroupSessionsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-(--text-primary)">Your Group Sessions</h1>
            {groupSessions.map((session) => (
                <CrashCourseCard key={session.id} session={session} freelancer={users.find((u) => u.id === session.freelancerId)} />
            ))}
        </div>
    );
}
