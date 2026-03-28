import { NextResponse } from "next/server";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

export async function POST(req: Request) {
  const { description = "", subject = "General" } = await req.json().catch(() => ({}));
  const assignmentPattern = /question\s*\d+|solve\s+for\s+me|exact\s+answer|4b|5a/i;

  if (!hasOpenAI) {
    const isTooAssignmentSpecific = assignmentPattern.test(description);
    return NextResponse.json({
      intent: isTooAssignmentSpecific ? "assignment_help" : "concept_learning",
      topic: description.split(" ").slice(0, 4).join(" ") || subject,
      subjectArea: subject,
      estimatedDepth: "intermediate",
      isTooAssignmentSpecific,
      rephrased: isTooAssignmentSpecific
        ? `Help me understand the concept behind this ${subject} question so I can solve similar problems.`
        : undefined,
    });
  }

  const res = await openai.chat.completions.create({
    model: openrouterModel,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content:
          "You are a learning intent classifier. Return JSON only with keys: intent, topic, subjectArea, estimatedDepth, isTooAssignmentSpecific, rephrased.",
      },
      { role: "user", content: `${subject}\n${description}` },
    ],
  });

  try {
    return NextResponse.json(JSON.parse(res.choices?.[0]?.message?.content ?? ""));
  } catch {
    return NextResponse.json({
      intent: "concept_learning",
      topic: subject,
      subjectArea: subject,
      estimatedDepth: "introductory",
      isTooAssignmentSpecific: false,
    });
  }
}
