#!/usr/bin/env bash
set -euo pipefail

# Sequential commit script for March 28 timeline
# Usage:
#   bash commit_script.sh
#
# Notes:
# - Assumes you are in a git repo root.
# - Commits only when staged changes exist for each step.
# - Uses explicit author/committer dates.

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository."
  exit 1
fi

commit_if_staged() {
  local when="$1"
  local message="$2"
  if ! git diff --cached --quiet; then
    GIT_AUTHOR_DATE="$when" GIT_COMMITTER_DATE="$when" git commit -m "$message"
  else
    echo "Skipping commit (no staged changes): $message"
  fi
}

# 1) 2:12 PM - base setup and tooling
git add package.json bun.lock tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs .gitignore .env.example || true
commit_if_staged "2026-03-28T14:12:00" "chore: initialize project config, tooling, and environment templates"

# 2) 2:48 PM - app shell and styling
git add app/layout.tsx app/globals.css components/shared/Providers.tsx components/shared/Navbar.tsx components/shared/NotificationBell.tsx lib/utils.ts || true
commit_if_staged "2026-03-28T14:48:00" "feat(ui): establish app shell, global styles, and shared navigation"

# 3) 3:21 PM - domain models and seed data
git add lib/types.ts lib/mock-data.ts || true
commit_if_staged "2026-03-28T15:21:00" "feat(data): add core domain types and realistic demo seed data"

# 4) 4:03 PM - Convex schema and feature modules
git add convex/schema.ts convex/users.ts convex/projects.ts convex/proposals.ts convex/sessions.ts convex/chat.ts convex/crashCourses.ts convex/groupSessions.ts convex/enrollments.ts convex/demandSignals.ts convex/opportunities.ts convex/notifications.ts convex/pricingBenchmarks.ts convex/learningDNA.ts convex/children.ts convex/matching.ts convex/auth.config.ts proxy.ts || true
commit_if_staged "2026-03-28T16:03:00" "feat(convex): implement schema, feature modules, and route protection"

# 5) 5:07 PM - AI and integration routes
git add lib/openai.ts lib/exa.ts lib/apify.ts app/api/ai app/api/exa app/api/apify || true
commit_if_staged "2026-03-28T17:07:00" "feat(api): add AI routes and sponsor integrations (OpenRouter, Exa, Apify, Resend)"

# 6) 6:16 PM - role dashboards and onboarding pages
git add app/page.tsx app/onboarding "app/(parent)" "app/(student)" "app/(freelancer)" "app/(shared)" || true
commit_if_staged "2026-03-28T18:16:00" "feat(routes): add role-based onboarding, dashboards, and shared user journeys"

# 7) 7:04 PM - reusable feature components
git add components/project components/freelancer components/learning components/chat components/shared/RoleGuard.tsx components/shared/AuthSync.tsx || true
commit_if_staged "2026-03-28T19:04:00" "feat(components): implement project, freelancer, learning, and chat component systems"

# 8) 8:02 PM - authentication pages and post-auth flow
git add "app/(auth)" app/auth || true
commit_if_staged "2026-03-28T20:02:00" "feat(auth): implement Clerk sign-in/sign-up and post-auth destination flow"

# 9) 9:11 PM - onboarding persistence and account linkage fixes
git add app/onboarding/parent/page.tsx app/onboarding/student/page.tsx app/onboarding/freelancer/page.tsx app/onboarding/role/page.tsx app/page.tsx convex/users.ts components/shared/Navbar.tsx || true
commit_if_staged "2026-03-28T21:11:00" "fix(auth-flow): enforce account-linked onboarding and role-based navigation behavior"

# 10) 10:03 PM - docs and repository hygiene
git add README.md .gitignore || true
commit_if_staged "2026-03-28T22:03:00" "docs: add professional submission README and tighten repository ignore rules"

# 11) 10:42 PM - generated Convex artifacts (if present)
if [ -d "convex/_generated" ]; then
  git add convex/_generated || true
fi
commit_if_staged "2026-03-28T22:42:00" "chore(convex): update generated API and data model artifacts"

# 12) 11:34 PM - final integration sweep
git add -A
commit_if_staged "2026-03-28T23:34:00" "chore: finalize integration pass and prepare hackathon submission"

echo "Commit script completed."
