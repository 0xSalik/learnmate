"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const helpTypeOptions = ["Arts", "Science", "Coding", "Writing", "Design"];

export default function ParentOnboardingPage() {
    const router = useRouter();
    const currentUser = useQuery(api.users.getCurrentUser);
    const completeParentOnboarding = useMutation(api.users.completeParentOnboarding);
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [childName, setChildName] = useState("");
    const [childGrade, setChildGrade] = useState("");
    const [helpTypes, setHelpTypes] = useState<string[]>([]);
    const [preferredType, setPreferredType] = useState("either");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleHelpType = (type: string) => {
        setHelpTypes((prev) =>
            prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
        );
    };

    const nextStep = async () => {
        setError(null);

        if (step < 3) {
            setStep((s) => s + 1);
            return;
        }

        setIsSubmitting(true);
        try {
            await completeParentOnboarding({
                name: name.trim() || "Parent",
                city: city.trim() || "",
                childName: childName.trim() || "Child",
                childGrade: childGrade.trim() || undefined,
                helpTypes,
                preferredLearningMode: preferredType as "virtual" | "in_person" | "either",
            });

            router.push("/parent/dashboard");
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
            <h1 className="text-3xl font-semibold text-text-primary">Parent Onboarding</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <span>Step {step} of 3</span>
                <span aria-hidden>•</span>
                <Link href="/sign-up" className="text-brand-primary hover:underline">Create account</Link>
                <span>/</span>
                <Link href="/sign-in" className="text-brand-primary hover:underline">Log in</Link>
            </div>

            <div className="mt-5 space-y-4 rounded-2xl border border-border-subtle bg-white p-5">
                {step === 1 && (
                    <>
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
                        <input
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            placeholder="Child name"
                            className="w-full rounded-xl border border-border-subtle px-3 py-2"
                        />
                        <input
                            value={childGrade}
                            onChange={(e) => setChildGrade(e.target.value)}
                            placeholder="Child grade / class (optional)"
                            className="w-full rounded-xl border border-border-subtle px-3 py-2"
                        />
                    </>
                )}
                {step === 2 && (
                    <div>
                        <p className="text-sm text-text-secondary">Select help types</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {helpTypeOptions.map((type) => {
                                const selected = helpTypes.includes(type);
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleHelpType(type)}
                                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${selected
                                            ? "border-brand-primary bg-orange-50 text-text-primary"
                                            : "border-border-subtle text-text-secondary hover:border-brand-primary/40"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div>
                        <label htmlFor="preferredType" className="text-sm text-text-secondary">Preferred type</label>
                        <select
                            id="preferredType"
                            value={preferredType}
                            onChange={(e) => setPreferredType(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-text-primary"
                        >
                            <option value="virtual">Virtual</option>
                            <option value="in_person">In-person</option>
                            <option value="either">Either</option>
                        </select>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(1, s - 1))}
                        className="rounded-xl border border-border-subtle px-3 py-2"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            void nextStep();
                        }}
                        disabled={isSubmitting}
                        className="rounded-xl bg-brand-primary px-3 py-2 text-white"
                    >
                        {isSubmitting ? "Saving..." : step === 3 ? "Finish" : "Next"}
                    </button>
                </div>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
        </div>
    );
}
