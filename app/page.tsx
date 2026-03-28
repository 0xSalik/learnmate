"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === "school_student" && !currentUser.educationStage && currentUser.course !== "__role_selected__") {
      router.replace("/onboarding/role");
      return;
    }

    if (currentUser.role === "parent") {
      router.replace("/parent/dashboard");
      return;
    }

    if (currentUser.role === "freelancer") {
      router.replace("/freelancer/dashboard");
      return;
    }

    router.replace("/student/dashboard");
  }, [currentUser, router]);

  if (currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-text-secondary">Redirecting to your dashboard...</p>
      </div>
    );
  }

  const roles = [
    {
      href: "/onboarding/role",
      title: "Parent",
      subtitle: "I want my child to learn, even when I return home late from work.",
    },
    {
      href: "/onboarding/role",
      title: "Student",
      subtitle: "I need concept clarity from someone who recently learned this too.",
    },
    {
      href: "/onboarding/role",
      title: "Freelancer",
      subtitle: "I want flexible income by helping learners truly understand.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-warm">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-14 md:px-6">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-text-primary md:text-5xl">
          LearnMate: near-peer learning that builds understanding, not shortcuts.
        </h1>
        <p className="mt-4 max-w-2xl text-text-secondary">
          Built for working parents, middle/high school students, university learners, and college freelancers who want dignified, outcome-tracked learning support.
        </p>
        <div className="mt-4 flex items-center gap-3 text-sm">
          <Link href="/sign-up" className="rounded-lg bg-brand-primary px-3 py-2 text-white">Create account</Link>
          <Link href="/sign-in" className="rounded-lg border border-border-subtle px-3 py-2 text-text-primary">Log in</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <Link
              key={role.title}
              href={role.href}
              className="group rounded-3xl border border-border-subtle bg-white p-5 transition hover:-translate-y-0.5 hover:shadow"
            >
              <p className="text-2xl font-semibold text-text-primary">{role.title}</p>
              <p className="mt-2 line-clamp-3 text-sm text-text-secondary">{role.subtitle}</p>
              <p className="mt-4 text-sm font-medium text-brand-primary">Continue →</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
