import { NextResponse } from "next/server";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

export async function POST(req: Request) {
  const { topic = "", subjectArea = "", durationMinutes = 60, benchmarkPrice = 299 } = await req.json().catch(() => ({}));

  if (!hasOpenAI) {
    return NextResponse.json({
      suggestedTitle: `${topic} — From Confused to Confident`,
      description: `After this session, you will explain ${topic} clearly and solve common problems without guesswork.`,
      whyItMatters: `This topic appears repeatedly in assessments and interviews.`,
      suggestedPricePerSeat: benchmarkPrice,
      outline: [
        {
          segment: "Core mental model",
          durationMinutes: Math.floor(durationMinutes * 0.35),
          whatYouWillUnderstand: "The central logic behind the topic",
        },
        {
          segment: "Practice patterns",
          durationMinutes: Math.floor(durationMinutes * 0.35),
          whatYouWillUnderstand: "How to apply the concept to common question types",
        },
        {
          segment: "Error fixing",
          durationMinutes: Math.floor(durationMinutes * 0.3),
          whatYouWillUnderstand: "How to self-debug typical mistakes",
        },
      ],
    });
  }

  const res = await openai.chat.completions.create({
    model: openrouterModel,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Return JSON only with keys: outline, description, whyItMatters, suggestedPricePerSeat, suggestedTitle. Use outcome-first language.",
      },
      {
        role: "user",
        content: JSON.stringify({ topic, subjectArea, durationMinutes, benchmarkPrice }),
      },
    ],
  });

  try {
    return NextResponse.json(JSON.parse(res.choices?.[0]?.message?.content ?? ""));
  } catch {
    return NextResponse.json({
      suggestedTitle: topic,
      description: `After this session, you will understand ${topic}.`,
      whyItMatters: "High-frequency concept",
      suggestedPricePerSeat: benchmarkPrice,
      outline: [],
    });
  }
}
