import { NextResponse } from "next/server";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

type OutlineRow = {
  segment: string;
  durationMinutes: number;
  whatYouWillUnderstand: string;
};

function safeParseJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
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

function normalizeOutline(input: any, totalMinutes: number): OutlineRow[] {
  const rows: OutlineRow[] = Array.isArray(input)
    ? input
        .map((x: any) => ({
          segment: String(x?.segment ?? "").trim(),
          durationMinutes: Number.isFinite(Number(x?.durationMinutes)) ? Number(x.durationMinutes) : 0,
          whatYouWillUnderstand: String(x?.whatYouWillUnderstand ?? "").trim(),
        }))
        .filter((x) => x.segment && x.whatYouWillUnderstand)
    : [];

  if (!rows.length) {
    return [
      {
        segment: "Core model",
        durationMinutes: Math.max(10, Math.floor(totalMinutes * 0.35)),
        whatYouWillUnderstand: "The core concept in plain language",
      },
      {
        segment: "Guided drills",
        durationMinutes: Math.max(10, Math.floor(totalMinutes * 0.35)),
        whatYouWillUnderstand: "How to solve common question patterns",
      },
      {
        segment: "Debug and recap",
        durationMinutes: Math.max(10, totalMinutes - Math.floor(totalMinutes * 0.7)),
        whatYouWillUnderstand: "How to avoid repeated mistakes",
      },
    ];
  }

  const clamped = rows.map((r) => ({
    ...r,
    durationMinutes: Math.min(90, Math.max(5, r.durationMinutes || 10)),
  }));

  return clamped.slice(0, 8);
}

export async function POST(req: Request) {
  const {
    topic = "",
    subjectArea = "",
    depth = "intermediate",
    durationMinutes = 60,
    benchmarkPrice = 299,
    maxSeats = 20,
    isRemote = true,
  } = await req.json().catch(() => ({}));

  const safeDuration = Number.isFinite(Number(durationMinutes)) ? Number(durationMinutes) : 60;
  const safePrice = Number.isFinite(Number(benchmarkPrice)) ? Number(benchmarkPrice) : 299;

  if (!hasOpenAI) {
    return NextResponse.json({
      suggestedTitle: `${topic} — From Confused to Confident`,
      description: `After this session, you will explain ${topic} clearly and solve common problems without guesswork.`,
      whyItMatters: `This topic appears repeatedly in assessments and interviews.`,
      suggestedPricePerSeat: safePrice,
      outline: normalizeOutline([], safeDuration),
    });
  }

  const res = await openai.chat.completions.create({
    model: openrouterModel,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Return JSON only with keys: outline, description, whyItMatters, suggestedPricePerSeat, suggestedTitle. Use outcome-first language. Outline must be an array of objects: segment, durationMinutes, whatYouWillUnderstand.",
      },
      {
        role: "user",
        content: JSON.stringify({ topic, subjectArea, depth, durationMinutes: safeDuration, benchmarkPrice: safePrice, maxSeats, isRemote }),
      },
    ],
  });

  const parsed = safeParseJson(res.choices?.[0]?.message?.content ?? "");
  return NextResponse.json({
    suggestedTitle: String(parsed?.suggestedTitle ?? `${topic} Masterclass`).trim(),
    description: String(parsed?.description ?? `After this session, you will understand ${topic}.`).trim(),
    whyItMatters: String(parsed?.whyItMatters ?? "High-frequency concept").trim(),
    suggestedPricePerSeat: Number.isFinite(Number(parsed?.suggestedPricePerSeat))
      ? Number(parsed.suggestedPricePerSeat)
      : safePrice,
    outline: normalizeOutline(parsed?.outline, safeDuration),
  });
}
