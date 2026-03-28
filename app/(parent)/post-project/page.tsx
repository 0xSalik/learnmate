import { ProjectPostingWizard } from "@/components/project/ProjectPostingWizard";

export default function ParentPostProjectPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-(--text-primary)">Post a Project</h1>
            <ProjectPostingWizard />
        </div>
    );
}
