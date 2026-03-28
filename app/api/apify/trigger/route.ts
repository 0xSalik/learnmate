import { NextResponse } from "next/server";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

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
      signal: AbortSignal.timeout(8000),
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

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function generateDemandFallback(reason: string) {
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  if (hasOpenAI) {
    try {
      const completion = await openai.chat.completions.create({
        model: openrouterModel,
        temperature: 0.95,
        messages: [
          {
            role: "system",
            content:
              "Generate 8 synthetic demand signal rows for student learning marketplace India. Return ONLY JSON array with keys: topic,subjectArea,requestCount7d,requestCount24h,avgBudgetOffered,trendDirection. trendDirection must be rising|stable|falling.",
          },
          {
            role: "user",
            content: JSON.stringify({ seed, reason }),
          },
        ],
      });

      const raw = completion.choices?.[0]?.message?.content ?? "[]";
      const parsed = safeJsonParse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.slice(0, 8).map((row: any) => ({
          topic: String(row?.topic ?? "High-demand topic"),
          subjectArea: String(row?.subjectArea ?? "General"),
          requestCount7d: Number.isFinite(Number(row?.requestCount7d)) ? Number(row.requestCount7d) : 10,
          requestCount24h: Number.isFinite(Number(row?.requestCount24h)) ? Number(row.requestCount24h) : 2,
          avgBudgetOffered: Number.isFinite(Number(row?.avgBudgetOffered)) ? Number(row.avgBudgetOffered) : 300,
          trendDirection: ["rising", "stable", "falling"].includes(String(row?.trendDirection))
            ? String(row.trendDirection)
            : "stable",
        }));
      }
    } catch {
      // fall through
    }
  }

  return Array.from({ length: 8 }).map((_, idx) => ({
    topic: `Fallback Topic ${idx + 1} (${seed.slice(-4)})`,
    subjectArea: ["Math", "Science", "Coding", "English"][idx % 4],
    requestCount7d: 8 + idx * 3,
    requestCount24h: 1 + (idx % 4),
    avgBudgetOffered: 250 + idx * 40,
    trendDirection: idx % 3 === 0 ? "rising" : idx % 3 === 1 ? "stable" : "falling",
  }));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const fallbackOnly = Boolean(body?.fallbackOnly);

  if (fallbackOnly) {
    const generatedSignals = await generateDemandFallback("apify_default_fallback");
    return NextResponse.json({
      taskId: "fallback-only",
      status: "failed",
      mode: "fallback",
      message: "Using default generated demand data.",
      generatedSignals,
      actorCalled: false,
    });
  }

  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_ACTOR_ID;

  if (!token || !actorId) {
    const generatedSignals = await generateDemandFallback("apify_not_configured");
    return NextResponse.json({
      taskId: "demo-seeded",
      status: "failed",
      mode: "demo",
      message: "APIFY_TOKEN or APIFY_ACTOR_ID is missing, using demo response.",
      generatedSignals,
      actorCalled: false,
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

      const generatedSignals = await generateDemandFallback("apify_failed");
      return NextResponse.json(
        {
          taskId: "demo-fallback",
          status: "failed",
          mode: "fallback",
          message: apiMessage,
          actorCalled: true,
          generatedSignals,
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

    const generatedSignals = await generateDemandFallback("apify_timeout_or_exception");
    // Return an explicit non-500 response so the UI can handle this gracefully.
    return NextResponse.json(
      {
        taskId: "demo-fallback",
        status: "failed",
        mode: "fallback",
        message,
        actorCalled: false,
        generatedSignals,
      },
      { status: 200 }
    );
  }
}
