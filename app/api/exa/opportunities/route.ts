import { NextResponse } from "next/server";
import { exa, hasExa } from "@/lib/exa";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

export const runtime = "nodejs";

type OpportunityRow = {
  id: string;
  freelancerId?: string;
  title: string;
  url: string;
  description: string;
  aiSummary: string;
  category: "gig" | "internship" | "hackathon" | "scholarship" | "competition" | "volunteer";
  relevanceScore: number;
  createdAt: number;
  expiresAt: number;
  deadline?: string;
  prize?: string;
};

function normalizeCategory(value: unknown): OpportunityRow["category"] {
  const v = String(value ?? "").toLowerCase();
  if (v === "internship" || v === "hackathon" || v === "scholarship" || v === "competition" || v === "volunteer") {
    return v;
  }
  return "gig";
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function generateFallbackOpportunities(args: {
  freelancerId?: string;
  skills: string[];
  city: string;
  reason: string;
}): Promise<OpportunityRow[]> {
  const now = Date.now();
  const seed = `${now}-${Math.random().toString(36).slice(2, 10)}`;

  if (hasOpenAI) {
    try {
      const completion = await openai.chat.completions.create({
        model: openrouterModel,
        temperature: 0.9,
        messages: [
          {
            role: "system",
            content:
              "Generate synthetic but realistic student freelancer opportunities in India. Return ONLY a JSON array with 8 objects and keys: title,url,description,aiSummary,category,deadline,prize,relevanceScore. Use category from: gig,internship,hackathon,scholarship,competition,volunteer.",
          },
          {
            role: "user",
            content: JSON.stringify({
              seed,
              reason: args.reason,
              city: args.city,
              skills: args.skills,
            }),
          },
        ],
      });

      const raw = completion.choices?.[0]?.message?.content ?? "[]";
      const arr = safeJsonParse(raw);
      if (Array.isArray(arr) && arr.length) {
        return arr.slice(0, 10).map((item: any, idx: number) => ({
          id: `${seed}-${idx}`,
          freelancerId: args.freelancerId,
          title: String(item?.title ?? `Opportunity ${idx + 1}`),
          url: String(item?.url ?? `https://example.com/opportunities/${seed}/${idx}`),
          description: String(item?.description ?? "Project support opportunity."),
          aiSummary: String(item?.aiSummary ?? "Likely a good fit for your profile."),
          category: normalizeCategory(item?.category),
          deadline: item?.deadline ? String(item.deadline) : undefined,
          prize: item?.prize ? String(item.prize) : undefined,
          relevanceScore: Number.isFinite(Number(item?.relevanceScore)) ? Number(item.relevanceScore) : 0.72,
          createdAt: now,
          expiresAt: now + 7 * 24 * 60 * 60 * 1000,
        }));
      }
    } catch {
      // continue to hard fallback
    }
  }

  return Array.from({ length: 8 }).map((_, idx) => ({
    id: `${seed}-${idx}`,
    freelancerId: args.freelancerId,
    title: `Skill Sprint ${idx + 1} • ${args.city}`,
    url: `https://example.com/opportunities/${seed}/${idx}`,
    description: `Short-term assignment tailored for ${args.skills.join(", ") || "general tutoring"}.`,
    aiSummary: `Generated fallback set (${args.reason}) with unique seed ${seed}.`,
    category: "gig",
    relevanceScore: 0.65 + idx * 0.03,
    createdAt: now,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000,
  }));
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export async function POST(req: Request) {
  const { freelancerId, skills = [], city = "India", fallbackOnly = false } = await req.json().catch(() => ({}));
  const parsedSkills = Array.isArray(skills) ? skills.map((s: unknown) => String(s)) : [];
  const parsedCity = String(city || "India");

  if (fallbackOnly) {
    const results = await generateFallbackOpportunities({
      freelancerId: freelancerId ? String(freelancerId) : undefined,
      skills: parsedSkills,
      city: parsedCity,
      reason: "exa_default_fallback",
    });
    return NextResponse.json({ results, count: results.length, mode: "fallback", source: "openrouter" });
  }

  if (!hasExa) {
    const results = await generateFallbackOpportunities({
      freelancerId: freelancerId ? String(freelancerId) : undefined,
      skills: parsedSkills,
      city: parsedCity,
      reason: "exa_not_configured",
    });
    return NextResponse.json({ results, count: results.length, mode: "fallback", source: "openrouter" });
  }

  try {
    const query = `freelance gigs internships hackathons for ${parsedSkills.join(", ")} students ${parsedCity}`;
    const res: any = await withTimeout(exa.searchAndContents(query, { numResults: 10, text: true }), 8000);

    const results = (res.results ?? []).map((item: any, idx: number) => ({
      id: `${idx}`,
      freelancerId: freelancerId ? String(freelancerId) : undefined,
      title: item.title ?? "Opportunity",
      url: item.url,
      description: (item.text ?? "").slice(0, 220),
      aiSummary: "Relevant to your skill profile and city preference.",
      category: "gig",
      relevanceScore: 0.8,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }));

    if (!results.length) {
      const fallback = await generateFallbackOpportunities({
        freelancerId: freelancerId ? String(freelancerId) : undefined,
        skills: parsedSkills,
        city: parsedCity,
        reason: "exa_empty",
      });
      return NextResponse.json({ results: fallback, count: fallback.length, mode: "fallback", source: "openrouter" });
    }

    return NextResponse.json({ results, count: results.length, mode: "live", source: "exa" });
  } catch {
    const fallback = await generateFallbackOpportunities({
      freelancerId: freelancerId ? String(freelancerId) : undefined,
      skills: parsedSkills,
      city: parsedCity,
      reason: "exa_failed_or_timeout",
    });
    return NextResponse.json({ results: fallback, count: fallback.length, mode: "fallback", source: "openrouter" });
  }
}
