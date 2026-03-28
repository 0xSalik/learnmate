export const dynamic = "force-dynamic";

import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

const encoder = new TextEncoder();

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ transcriptChunks: [] }));
  const chunk = body?.transcriptChunks?.at?.(-1) ?? "";

  let suggestion =
    chunk.length > 20
      ? "Child asked the same idea twice. Try a physical analogy and ask for a 20-second teach-back."
      : "Pause and check understanding before step 4.";

  if (hasOpenAI) {
    try {
      const ai = await openai.chat.completions.create({
        model: openrouterModel,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You are a live teaching copilot. Reply in one concise actionable coaching suggestion for the next 60 seconds.",
          },
          {
            role: "user",
            content: JSON.stringify({
              sessionId: body?.sessionId,
              latestTranscript: chunk,
              transcriptChunks: body?.transcriptChunks ?? [],
              childDNA: body?.childDNA ?? null,
            }),
          },
        ],
      });
      suggestion = ai.choices?.[0]?.message?.content?.trim() || suggestion;
    } catch {
      // Keep fallback suggestion
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${suggestion}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}
