"use client";

import { Bell } from "lucide-react";

type Props = {
    count?: number;
};

export function NotificationBell({ count = 3 }: Props) {
    return (
        <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary"
            aria-label="Notifications"
        >
            <Bell className="h-4 w-4" />
            {count > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1 text-xs font-bold text-white">
                    {count}
                </span>
            )}
        </button>
    );
}
