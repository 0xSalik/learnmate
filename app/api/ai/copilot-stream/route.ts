export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ transcriptChunks: [] }));
  const chunk = body?.transcriptChunks?.at?.(-1) ?? "";
  const suggestion =
    chunk.length > 20
      ? "Child asked the same idea twice. Try a physical analogy and ask for a 20-second teach-back."
      : "Pause and check understanding before step 4.";

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
