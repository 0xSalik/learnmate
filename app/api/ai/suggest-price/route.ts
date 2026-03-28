import { NextResponse } from "next/server";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const fallback = () => {
    const estimatedHours = Number(body?.estimatedHours ?? 2);
    const complexity = String(body?.complexity ?? "medium");
    const mode = String(body?.serviceMode ?? "guided_session");
    const complexityFactor = complexity === "high" ? 1.4 : complexity === "low" ? 0.85 : 1;
    const modeFactor = mode === "full_build" ? 1.35 : mode === "accompanied_build" ? 1.15 : 1;
    const base = Math.round(estimatedHours * 350 * complexityFactor * modeFactor);
    const min = Math.max(300, base - 180);
    const max = min + 420;
    return {
      min,
      max,
      reasoning: "Estimated from effort hours, project complexity, and service mode.",
    };
  };

  if (!hasOpenAI) {
    return NextResponse.json(fallback());
  }

  const ai = await openai.chat.completions.create({
    model: openrouterModel,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You estimate tutoring/project support budget in INR. Return JSON only with keys: min, max, reasoning.",
      },
      {
        role: "user",
        content: JSON.stringify({
          title: body?.title,
          subject: body?.subject,
          city: body?.city,
          serviceMode: body?.serviceMode,
          complexity: body?.complexity,
          estimatedHours: body?.estimatedHours,
        }),
      },
    ],
  });

  try {
    const parsed = JSON.parse(ai.choices?.[0]?.message?.content ?? "");
    return NextResponse.json({
      min: Number(parsed.min),
      max: Number(parsed.max),
      reasoning: String(parsed.reasoning ?? "AI-assisted estimate."),
    });
  } catch {
    return NextResponse.json(fallback());
  }
}
