"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";
import { AuthSync } from "@/components/shared/AuthSync";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://demo.convex.cloud");

export function Providers({ children }: { children: ReactNode }) {
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        return (
            <ClerkProvider>
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    <AuthSync />
                    {children}
                </ConvexProviderWithClerk>
            </ClerkProvider>
        );
    }

    return (
        <ConvexProvider client={convex}>{children}</ConvexProvider>
    );
}
