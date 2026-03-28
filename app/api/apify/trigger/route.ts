import { NextResponse } from "next/server";
import { apify, hasApify } from "@/lib/apify";

export async function POST() {
  if (!hasApify || !process.env.APIFY_ACTOR_ID) {
    return NextResponse.json({
      taskId: "demo-seeded",
      status: "triggered",
      mode: "demo",
      message: "APIFY_TOKEN or APIFY_ACTOR_ID is missing, using demo response.",
    });
  }

  try {
    const run = await apify.actor(process.env.APIFY_ACTOR_ID).call({
      startUrls: [
        { url: "https://internshala.com/gigs" },
        { url: "https://www.fiverr.com/categories" },
      ],
    });

    return NextResponse.json({ taskId: run.id, status: "triggered", mode: "live" });
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
