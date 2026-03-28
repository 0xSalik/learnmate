"use client";

import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AuthSync() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const upsertFromClerk = useMutation(api.users.upsertFromClerk);
    const lastSyncedUserId = useRef<string | null>(null);
    const warnedMissingTemplate = useRef(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user?.id) return;
        if (lastSyncedUserId.current === user.id) return;

        void (async () => {
            const convexToken = await getToken({ template: "convex" }).catch(() => null);
            if (!convexToken) {
                if (!warnedMissingTemplate.current) {
                    warnedMissingTemplate.current = true;
                    console.warn("Clerk template 'convex' is missing or not ready. Skipping Convex user sync.");
                }
                return;
            }

            const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

            try {
                await upsertFromClerk({
                    name: fullName || user.username || "Learner",
                    email:
                        user.primaryEmailAddress?.emailAddress ??
                        user.emailAddresses[0]?.emailAddress ??
                        `${user.id}@clerk.local`,
                    avatar: user.imageUrl,
                });
                lastSyncedUserId.current = user.id;
            } catch (error) {
                console.error("Failed to sync Clerk user to Convex", error);
            }
        })();
    }, [isLoaded, isSignedIn, user, upsertFromClerk, getToken]);

    return null;
}
