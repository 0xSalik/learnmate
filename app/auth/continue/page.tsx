"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AuthContinuePage() {
    const router = useRouter();
    const destination = useQuery(api.users.getPostAuthDestination);

    useEffect(() => {
        if (!destination) return;
        router.replace(destination);
    }, [destination, router]);

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <p className="text-sm text-text-secondary">Setting up your session...</p>
        </div>
    );
}
