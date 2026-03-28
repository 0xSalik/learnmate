"use client";

import type { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Role } from "@/lib/types";

export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
    const user = useQuery(api.users.getCurrentUser);

    if (user === undefined) {
        return <p className="text-sm text-text-secondary">Checking access...</p>;
    }

    if (!user) {
        return <p className="text-sm text-text-secondary">Please sign in to continue.</p>;
    }

    if (user.role !== role) {
        return <p className="text-sm text-text-secondary">This area is only for {role.replace("_", " ")} accounts.</p>;
    }

    return <>{children}</>;
}
