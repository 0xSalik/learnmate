import { NextResponse } from "next/server";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

export async function POST(req: Request) {
  const { sessionNotes, childAge = 11, subject = "General" } = await req.json().catch(() => ({}));

  if (!hasOpenAI) {
    return NextResponse.json({
      questions: [
        {
          question: `In ${subject}, what is the first thing to check before solving?`,
          options: ["Given data", "Pen color", "Page number", "Friend's answer"],
          correctIndex: 0,
        },
        {
          question: "What helps you understand better?",
          options: ["Ask why", "Memorize blindly", "Skip steps", "Rush"],
          correctIndex: 0,
        },
        {
          question: "If confused, what should you do next?",
          options: ["Hide it", "Ask for one example", "Quit", "Copy"],
          correctIndex: 1,
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
          "Generate exactly 3 MCQs with four options each. Return JSON only: {questions:[{question,options,correctIndex}]}",
      },
      {
        role: "user",
        content: `Age: ${childAge}\nSubject: ${subject}\nSession notes: ${sessionNotes}`,
      },
    ],
  });

  try {
    return NextResponse.json(JSON.parse(res.choices?.[0]?.message?.content ?? ""));
  } catch {
    return NextResponse.json({ questions: [] });
  }
}
