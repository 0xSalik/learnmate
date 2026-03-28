import { NextResponse } from "next/server";

export const runtime = "nodejs";

type JsonRecord = Record<string, any>;

async function runActor(actorId: string, token: string, build?: string) {
  const query = new URLSearchParams({
    token,
    memory: "1024",
    timeout: "300",
  });

  if (build) query.set("build", build);

  const response = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs?${query.toString()}`,
    {
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
    }
  );

  const payload: JsonRecord | null = await response.json().catch(() => null);
  return { response, payload };
}

async function getLatestSuccessfulBuild(actorId: string, token: string): Promise<string | null> {
  const query = new URLSearchParams({
    token,
    limit: "1",
    desc: "1",
    status: "SUCCEEDED",
  });

  const response = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/builds?${query.toString()}`,
    { method: "GET" }
  );

  const payload: JsonRecord | null = await response.json().catch(() => null);
  const first = payload?.data?.items?.[0];

  if (!first) return null;
  if (typeof first.versionNumber === "string" && first.versionNumber) return first.versionNumber;
  if (typeof first.buildNumber === "string" && first.buildNumber) return first.buildNumber;
  if (typeof first.tag === "string" && first.tag) return first.tag;
  return null;
}

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
    // First, call actor without forcing a build tag.
    let { response, payload } = await runActor(actorId, token);

    // If the actor has no latest build pointer, retry with latest successful build.
    const message = payload?.error?.message ?? payload?.message ?? "";
    if (!response.ok && /build with tag\s+"latest"\s+was not found/i.test(String(message))) {
      const fallbackBuild = await getLatestSuccessfulBuild(actorId, token);
      if (fallbackBuild) {
        ({ response, payload } = await runActor(actorId, token, fallbackBuild));
      }
    }

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
          actorCalled: true,
        },
        { status: 200 }
      );
    }

    const runId = payload?.data?.id;

    return NextResponse.json({
      taskId: runId ?? "unknown",
      status: "triggered",
      mode: "live",
      actorCalled: true,
    });
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
        actorCalled: false,
      },
      { status: 200 }
    );
  }
}
