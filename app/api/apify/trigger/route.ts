import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_ACTOR_ID;

  if (!token || !actorId) {
    return NextResponse.json({
      taskId: "demo-seeded",
      status: "triggered",
      mode: "demo",
      message: "APIFY_TOKEN or APIFY_ACTOR_ID is missing, using demo response.",
    });
  }

  try {
    const query = new URLSearchParams({
      token,
      memory: "1024",
      timeout: "300",
      build: "latest",
    });

    const response = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?${query.toString()}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        startUrls: [
          { url: "https://internshala.com/gigs" },
          { url: "https://www.fiverr.com/categories" },
        ],
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const apiMessage =
        payload?.error?.message ??
        payload?.message ??
        `Apify API request failed with status ${response.status}`;

      return NextResponse.json(
        {
          taskId: "demo-fallback",
          status: "failed",
          mode: "fallback",
          message: apiMessage,
        },
        { status: 200 }
      );
    }

    const runId = payload?.data?.id;

    return NextResponse.json({ taskId: runId ?? "unknown", status: "triggered", mode: "live" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Apify trigger error";
    console.error("Apify trigger failed", error);

    // Return an explicit non-500 response so the UI can handle this gracefully.
    return NextResponse.json(
      {
        taskId: "demo-fallback",
        status: "failed",
        mode: "fallback",
        message,
      },
      { status: 200 }
    );
  }
}
