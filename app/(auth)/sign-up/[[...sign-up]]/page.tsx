import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface-warm px-4">
                <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-white p-6">
                    <h1 className="text-2xl font-semibold text-text-primary">Sign up</h1>
                    <p className="mt-2 text-sm text-text-secondary">Set Clerk keys to enable hosted authentication.</p>
                    <Link href="/" className="mt-4 inline-block text-brand-primary">Back to home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-warm px-4">
            <SignUp
                path="/sign-up"
                routing="path"
                signInUrl="/sign-in"
                forceRedirectUrl="/onboarding/role"
                fallbackRedirectUrl="/onboarding/role"
                signInForceRedirectUrl="/onboarding/role"
                signInFallbackRedirectUrl="/onboarding/role"
            />
        </div>
    );
}
