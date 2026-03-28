import type { ReactNode } from "react";
import { Navbar } from "@/components/shared/Navbar";

export default function FreelancerLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
        </>
    );
}
