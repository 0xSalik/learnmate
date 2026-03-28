import { FreelancerProfileCard } from "@/components/freelancer/FreelancerProfileCard";
import { users } from "@/lib/mock-data";

export default function FreelancerProfilePage() {
    const freelancer = users.find((u) => u.id === "f2")!;
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-(--text-primary)">Freelancer Profile</h1>
            <FreelancerProfileCard freelancer={freelancer} />
        </div>
    );
}
