"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useQuery } from "convex/react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { api } from "@/convex/_generated/api";

const links = [
    { href: "/parent/dashboard", label: "Parent" },
    { href: "/student/dashboard", label: "Student" },
    { href: "/freelancer/dashboard", label: "Freelancer" },
    { href: "/browse-sessions", label: "Group Classes" },
];

export function Navbar() {
    const currentUser = useQuery(api.users.getCurrentUser);

    return (
        <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-warm/95 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                <Link href="/" className="text-xl font-semibold tracking-tight text-text-primary">
                    Pahechan
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
                        <UserButton />
                    )}
                    <NotificationBell />
                </div>
            </nav>
        </header>
    );
}
