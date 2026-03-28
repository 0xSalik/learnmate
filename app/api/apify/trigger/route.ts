import { NextResponse } from "next/server";
import { apify, hasApify } from "@/lib/apify";

export async function POST() {
  if (!hasApify || !process.env.APIFY_ACTOR_ID) {
    return NextResponse.json({ taskId: "demo-seeded", status: "triggered" });
  }

  const run = await apify.actor(process.env.APIFY_ACTOR_ID).call({
    startUrls: [
      { url: "https://internshala.com/gigs" },
      { url: "https://www.fiverr.com/categories" },
    ],
  });

  return NextResponse.json({ taskId: run.id, status: "triggered" });
}
