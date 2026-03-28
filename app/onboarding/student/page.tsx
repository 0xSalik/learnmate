"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function StudentOnboardingPage() {
    const router = useRouter();
    const currentUser = useQuery(api.users.getCurrentUser);
    const destination = useQuery(api.users.getPostAuthDestination);
    const completeStudentOnboarding = useMutation(api.users.completeStudentOnboarding);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [educationStage, setEducationStage] = useState<"middle_school" | "high_school" | "university">("high_school");
    const [schoolOrUniversity, setSchoolOrUniversity] = useState("");
    const [gradeOrYear, setGradeOrYear] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!destination) return;
        if (destination !== "/onboarding/student") {
            router.replace(destination);
        }
    }, [destination, router]);

    const submit = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            await completeStudentOnboarding({
                name: name.trim() || "Student",
                city: city.trim() || "",
                educationStage,
                schoolOrUniversity: schoolOrUniversity.trim() || "",
                gradeOrYear: gradeOrYear.trim() || "",
            });

            router.push("/student/dashboard");
        } catch {
            setError("Please log in, then try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (currentUser === undefined) {
        return <p className="mx-auto max-w-2xl px-4 py-10 text-sm text-text-secondary">Loading account...</p>;
    }

    if (!currentUser) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-10">
                <h1 className="text-3xl font-semibold text-text-primary">Sign in required</h1>
                <p className="mt-2 text-text-secondary">You must sign in before onboarding so your data is linked to your account.</p>
                <div className="mt-4 flex gap-2">
                    <Link href="/sign-in" className="rounded-lg border border-border-subtle px-3 py-2 text-text-primary">Log in</Link>
                    <Link href="/sign-up" className="rounded-lg bg-brand-primary px-3 py-2 text-white">Create account</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <h1 className="text-3xl font-semibold text-text-primary">Student Onboarding</h1>
            <p className="mt-2 text-text-secondary">
                For middle school, high school, and university students.
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                <Link href="/sign-up" className="text-brand-primary hover:underline">Create account</Link>
                <span>/</span>
                <Link href="/sign-in" className="text-brand-primary hover:underline">Log in</Link>
            </div>

            <div className="mt-5 space-y-3 rounded-2xl border border-border-subtle bg-white p-5">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border-subtle px-3 py-2"
                />
                <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full rounded-xl border border-border-subtle px-3 py-2"
                />

                <div>
                    <label htmlFor="educationStage" className="text-sm text-text-secondary">Education stage</label>
                    <select
                        id="educationStage"
                        value={educationStage}
                        onChange={(e) =>
                            setEducationStage(e.target.value as "middle_school" | "high_school" | "university")
                        }
                        className="mt-2 w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-text-primary"
                    >
                        <option value="middle_school">Middle school</option>
                        <option value="high_school">High school</option>
                        <option value="university">University</option>
                    </select>
                </div>

                <input
                    value={schoolOrUniversity}
                    onChange={(e) => setSchoolOrUniversity(e.target.value)}
                    placeholder={educationStage === "university" ? "University / College" : "School"}
                    className="w-full rounded-xl border border-border-subtle px-3 py-2"
                />
                <input
                    value={gradeOrYear}
                    onChange={(e) => setGradeOrYear(e.target.value)}
                    placeholder={educationStage === "university" ? "Year (e.g. 1st year)" : "Grade / Class (e.g. 9)"}
                    className="w-full rounded-xl border border-border-subtle px-3 py-2"
                />

                <div className="rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-xs text-text-secondary">
                    On finish, your profile and learning DNA are saved to Convex.
                </div>

                <button
                    type="button"
                    onClick={() => {
                        void submit();
                    }}
                    disabled={isSubmitting}
                    className="rounded-xl bg-brand-primary px-3 py-2 text-white"
                >
                    {isSubmitting ? "Saving..." : "Finish"}
                </button>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
        </div>
    );
}
