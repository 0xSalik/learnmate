"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const roleCards = [
    {
        title: "Parent",
        subtitle: "Post help requests for your child and track learning outcomes.",
        role: "parent" as const,
        next: "/onboarding/parent",
    },
    {
        title: "Student",
        subtitle: "Middle school, high school, or university learners can ask directly.",
        role: "school_student" as const,
        next: "/onboarding/student",
    },
    {
        title: "Freelancer",
        subtitle: "Earn by teaching with accountable, concept-first support.",
        role: "freelancer" as const,
        next: "/onboarding/freelancer",
    },
];

export default function RoleSelectionPage() {
    const router = useRouter();
    const user = useQuery(api.users.getCurrentUser);
    const destination = useQuery(api.users.getPostAuthDestination);
    const setCurrentUserRole = useMutation(api.users.setCurrentUserRole);

    useEffect(() => {
        if (!destination || destination === "/onboarding/role") return;
        router.replace(destination);
    }, [destination, router]);

    const selectRole = async (role: "parent" | "school_student" | "freelancer", next: string) => {
        await setCurrentUserRole({ role });
        router.push(next);
    };

    if (user === undefined) {
        return <p className="mx-auto max-w-2xl px-4 py-10 text-sm text-text-secondary">Loading account...</p>;
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-10">
                <h1 className="text-3xl font-semibold text-text-primary">Sign in required</h1>
                <p className="mt-2 text-text-secondary">Create or log in to continue onboarding.</p>
                <div className="mt-4 flex gap-2">
                    <Link href="/sign-in" className="rounded-lg border border-border-subtle px-3 py-2 text-text-primary">
                        Log in
                    </Link>
                    <Link href="/sign-up" className="rounded-lg bg-brand-primary px-3 py-2 text-white">
                        Create account
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10">
            <h1 className="text-3xl font-semibold text-text-primary">Choose your account type</h1>
            <p className="mt-2 text-text-secondary">This links your Clerk account to a Pahechan user role.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                {roleCards.map((item) => (
                    <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                            void selectRole(item.role, item.next);
                        }}
                        className="rounded-3xl border border-border-subtle bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow"
                    >
                        <p className="text-2xl font-semibold text-text-primary">{item.title}</p>
                        <p className="mt-2 text-sm text-text-secondary">{item.subtitle}</p>
                        <p className="mt-4 text-sm font-medium text-brand-primary">Continue →</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
