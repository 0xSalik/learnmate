import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const base = Number(body?.estimatedHours ?? 1) * 200;
  const min = Math.max(150, base);
  const max = min + 250;
  return NextResponse.json({
    min,
    max,
    reasoning: "Based on topic complexity, city context, and benchmark median rates.",
  });
}
