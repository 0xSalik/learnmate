import { NextResponse } from "next/server";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

export async function POST() {
  if (!hasOpenAI) {
    return NextResponse.json({
      title: "Solar System Model",
      subject: "Science",
      grade: "6",
      deadline: "Next week",
      materials: ["Thermocol balls", "Acrylic paint", "Chart paper"],
      complexity: "medium",
      confidence: 0.83,
    });
  }

  const response = await openai.chat.completions.create({
    model: openrouterModel,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Extract project brief fields. Return compact JSON only with keys: title, subject, grade, deadline, materials, complexity, confidence.",
      },
      { role: "user", content: "School brief photo parsing request." },
    ],
  });

  const text = response.choices?.[0]?.message?.content ?? "";
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({
      title: "School Project",
      subject: "General",
      grade: "5",
      deadline: "Soon",
      materials: [],
      complexity: "medium",
      confidence: 0.6,
      raw: text,
    });
  }
}
