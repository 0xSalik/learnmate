"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { api } from "@/convex/_generated/api";

const links = [
    { href: "/parent/dashboard", label: "Parent" },
    { href: "/student/dashboard", label: "Student" },
    { href: "/freelancer/dashboard", label: "Freelancer" },
    { href: "/browse-sessions", label: "Group Classes" },
];

export function Navbar() {
    const router = useRouter();
    const currentUser = useQuery(api.users.getCurrentUser);
    const setCurrentUserRole = useMutation(api.users.setCurrentUserRole);
    const [switching, setSwitching] = useState(false);

    const roleMode = currentUser?.role === "freelancer"
        ? "freelancer"
        : currentUser?.role === "parent"
            ? "parent"
            : "school_student";

    const switchMode = async (nextRole: "parent" | "school_student" | "freelancer") => {
        if (!currentUser || switching || roleMode === nextRole) return;

        try {
            setSwitching(true);
            await setCurrentUserRole({ role: nextRole });
            router.push("/auth/continue");
        } finally {
            setSwitching(false);
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-warm/95 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                <Link href="/" className="text-xl font-semibold tracking-tight text-text-primary">
                    LearnMate
                </Link>
                <div className="hidden items-center gap-5 md:flex">
                    {links.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm text-text-secondary transition hover:text-text-primary"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    {!currentUser ? (
                        <div className="hidden items-center gap-2 md:flex">
                            <Link href="/sign-in" className="text-sm text-text-secondary transition hover:text-text-primary">
                                Log in
                            </Link>
                            <Link href="/sign-up" className="rounded-lg bg-brand-primary px-3 py-1.5 text-sm text-white">
                                Create account
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <select
                                value={roleMode}
                                disabled={switching}
                                onChange={(e) => {
                                    void switchMode(e.target.value as "parent" | "school_student" | "freelancer");
                                }}
                                className="hidden rounded-lg border border-border-subtle bg-white px-2 py-1.5 text-xs text-text-primary md:block"
                                aria-label="Switch account mode"
                            >
                                <option value="parent">Parent mode</option>
                                <option value="school_student">Student mode</option>
                                <option value="freelancer">Freelancer mode</option>
                            </select>
                            <UserButton />
                        </div>
                    )}
                    <NotificationBell />
                </div>
            </nav>
        </header>
    );
}
