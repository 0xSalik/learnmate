"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function FreelancerOnboardingPage() {
    const router = useRouter();
    const currentUser = useQuery(api.users.getCurrentUser);
    const completeFreelancerOnboarding = useMutation(api.users.completeFreelancerOnboarding);
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [university, setUniversity] = useState("");
    const [year, setYear] = useState("");
    const [skills, setSkills] = useState("");
    const [bio, setBio] = useState("");
    const [hourlyRate, setHourlyRate] = useState(300);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onNext = async () => {
        setError(null);
        if (step < 5) {
            setStep((s) => Math.min(5, s + 1));
            return;
        }

        setIsSubmitting(true);
        try {
            await completeFreelancerOnboarding({
                name: name.trim() || "Freelancer",
                city: city.trim() || "",
                university: university.trim() || "",
                year: Number.isFinite(Number(year)) ? Number(year) : undefined,
                skills: skills.split(",").map((v) => v.trim()).filter(Boolean),
                bio: bio.trim() || "",
                hourlyRate,
            });
            router.push("/freelancer/dashboard");
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
            <h1 className="text-3xl font-semibold text-text-primary">Freelancer Onboarding</h1>
            <p className="mt-1 text-text-secondary">Step {step} of 5</p>
            <div className="mt-5 space-y-3 rounded-2xl border border-border-subtle bg-white p-5">
                {step === 1 && (
                    <div className="space-y-2">
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                        <input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="University" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (optional)" className="w-full rounded-xl border border-border-subtle px-3 py-2" />
                    </div>
                )}
                {step === 2 && (
                    <input
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Skills (comma separated, e.g. math, python, science projects)"
                        className="w-full rounded-xl border border-border-subtle px-3 py-2"
                    />
                )}
                {step === 3 && <p className="text-sm text-text-secondary">Student ID verification is marked verified in demo mode.</p>}
                {step === 4 && (
                    <div className="space-y-2">
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" className="h-24 w-full rounded-xl border border-border-subtle px-3 py-2" />
                    </div>
                )}
                {step === 5 && <p className="text-sm text-text-secondary">Finish to save your account-linked freelancer profile.</p>}
                <div className="flex gap-2">
                    <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="rounded-xl border border-border-subtle px-3 py-2">Back</button>
                    <button onClick={() => { void onNext(); }} disabled={isSubmitting} className="rounded-xl bg-brand-primary px-3 py-2 text-white">{isSubmitting ? "Saving..." : step === 5 ? "Finish" : "Next"}</button>
                </div>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
        </div>
    );
}
