import { NextResponse } from "next/server";
import { exa, hasExa } from "@/lib/exa";
import { opportunities } from "@/lib/mock-data";

export async function POST(req: Request) {
  const { freelancerId, skills = [], city = "India" } = await req.json().catch(() => ({}));

  if (!hasExa) {
    const results = opportunities.filter((item) => item.freelancerId === freelancerId || freelancerId === undefined);
    return NextResponse.json({ results, count: results.length });
  }

  const query = `freelance gigs internships hackathons for ${skills.join(", ")} students ${city}`;
  const res = await exa.searchAndContents(query, { numResults: 10, text: true });

  const results = res.results.map((item: any, idx: number) => ({
    id: `${idx}`,
    freelancerId,
    title: item.title ?? "Opportunity",
    url: item.url,
    description: (item.text ?? "").slice(0, 220),
    aiSummary: "Relevant to your skill profile and city preference.",
    category: "gig",
    relevanceScore: 0.8,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }));

  return NextResponse.json({ results, count: results.length });
}
