import { OpportunityFeedCard } from "@/components/freelancer/OpportunityFeedCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { opportunities, projects } from "@/lib/mock-data";

export default function FreelancerDashboardPage() {
    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <section className="space-y-3 lg:col-span-2">
                <h1 className="text-2xl font-semibold text-text-primary">Active Work</h1>
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} proposalCount={project.id === "pr1" ? 2 : 0} />
                ))}
            </section>
            <aside className="space-y-3">
                <h2 className="text-xl font-semibold text-text-primary">Opportunity Hub</h2>
                {opportunities.map((opportunity) => (
                    <OpportunityFeedCard key={opportunity.id} opportunity={opportunity} />
                ))}
            </aside>
        </div>
    );
}
