import { CrashCoursePostingForm } from "@/components/project/CrashCoursePostingForm";

export default function StudentCrashCoursePostPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-(--text-primary)">Post a Crash Course Need</h1>
            <CrashCoursePostingForm />
        </div>
    );
}
