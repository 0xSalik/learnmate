import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { hasOpenAI, openai, openrouterModel } from "@/lib/openai";

export const runtime = "nodejs";

type ExtractedBrief = {
  title: string;
  subject: string;
  grade: string;
  deadline: string;
  materials: string[];
  complexity: "low" | "medium" | "high";
  confidence: number;
  summary: string;
};

const defaultBrief: ExtractedBrief = {
  title: "School Project",
  subject: "General",
  grade: "",
  deadline: "",
  materials: [],
  complexity: "medium",
  confidence: 0.45,
  summary: "Need concept clarity and guided support.",
};

function safeParseJson(raw: string): Record<string, unknown> | null {
  const text = raw.trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

    const maybeJson = text.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(maybeJson);
    } catch {
      return null;
    }
  }
}

function normalizeExtracted(input: Record<string, unknown> | null): ExtractedBrief {
  if (!input) return defaultBrief;

  const title = typeof input.title === "string" ? input.title.trim() : defaultBrief.title;
  const subject = typeof input.subject === "string" ? input.subject.trim() : defaultBrief.subject;
  const grade = typeof input.grade === "string" ? input.grade.trim() : "";
  const deadline = typeof input.deadline === "string" ? input.deadline.trim() : "";

  const materials = Array.isArray(input.materials)
    ? input.materials.map((v) => String(v).trim()).filter(Boolean).slice(0, 10)
    : [];

  const complexityRaw = typeof input.complexity === "string" ? input.complexity.toLowerCase() : "medium";
  const complexity: "low" | "medium" | "high" =
    complexityRaw === "low" || complexityRaw === "high" ? complexityRaw : "medium";

  const confidenceRaw = typeof input.confidence === "number" ? input.confidence : Number(input.confidence ?? 0.45);
  const confidence = Number.isFinite(confidenceRaw)
    ? Math.max(0, Math.min(1, confidenceRaw))
    : defaultBrief.confidence;

  const summary = typeof input.summary === "string" && input.summary.trim().length > 0
    ? input.summary.trim()
    : defaultBrief.summary;

  return {
    title: title || defaultBrief.title,
    subject: subject || defaultBrief.subject,
    grade,
    deadline,
    materials,
    complexity,
    confidence,
    summary,
  };
}

function fallbackExtractFromText(text: string): ExtractedBrief {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return defaultBrief;

  const firstSentence = normalized.split(/[.!?]/).map((s) => s.trim()).find(Boolean) ?? "";
  const title = firstSentence.slice(0, 80) || defaultBrief.title;

  const subjectMatch = normalized.match(/\b(math|mathematics|science|physics|chemistry|biology|history|geography|english|coding|python|accounting|economics)\b/i);
  const gradeMatch = normalized.match(/\b(class|grade|std)\s*([0-9]{1,2})\b/i);
  const deadlineMatch = normalized.match(/\b(deadline|submit|submission|due)\b[^.\n]{0,40}/i);

  const materials: string[] = [];
  const materialMatch = normalized.match(/\b(materials?|items? needed|requirements?)\b[:\-]?\s*([^.]*)/i);
  if (materialMatch?.[2]) {
    for (const item of materialMatch[2].split(/,|;| and /i)) {
      const cleaned = item.trim();
      if (cleaned) materials.push(cleaned);
    }
  }

  return {
    title,
    subject: subjectMatch ? subjectMatch[1] : defaultBrief.subject,
    grade: gradeMatch ? gradeMatch[2] : "",
    deadline: deadlineMatch ? deadlineMatch[0] : "",
    materials: materials.slice(0, 8),
    complexity: normalized.length > 1200 ? "high" : normalized.length > 400 ? "medium" : "low",
    confidence: 0.58,
    summary: normalized.slice(0, 280),
  };
}

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (
    type.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv") ||
    name.endsWith(".json")
  ) {
    return await file.text();
  }

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
    const data = await pdfParse(Buffer.from(await file.arrayBuffer()));
    return String(data?.text ?? "");
  }

  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(await file.arrayBuffer()) });
    return result.value ?? "";
  }

  if (type === "application/msword" || name.endsWith(".doc")) {
    // Legacy .doc is often binary and difficult to parse reliably in-browser apps.
    // We still attempt a plain text decode as a best effort fallback.
    const bytes = new Uint8Array(await file.arrayBuffer());
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }

  return "";
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  let supplementalText = "";
  let file: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const textInput = formData.get("text");
    const fileInput = formData.get("file");
    supplementalText = typeof textInput === "string" ? textInput : "";
    file = fileInput instanceof File ? fileInput : null;
  } else {
    const body = await req.json().catch(() => ({}));
    supplementalText = String(body?.text ?? "");
  }

  let extractedText = supplementalText;
  let imageDataUrl: string | null = null;

  if (file) {
    if (file.type.startsWith("image/")) {
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      imageDataUrl = `data:${file.type || "image/png"};base64,${base64}`;
    } else {
      extractedText = `${supplementalText}\n\n${await extractTextFromFile(file)}`.trim();
    }
  }

  if (!hasOpenAI) {
    return NextResponse.json(fallbackExtractFromText(extractedText));
  }

  try {
    let raw = "";

    if (imageDataUrl) {
      const response = await openai.chat.completions.create({
        model: openrouterModel,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You extract school project briefs. Return strict JSON only with keys: title, subject, grade, deadline, materials, complexity, confidence, summary.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the brief details from this uploaded school brief image.",
              },
              {
                type: "image_url",
                image_url: { url: imageDataUrl },
              },
            ],
          } as any,
        ],
      });
      raw = response.choices?.[0]?.message?.content ?? "";
    } else {
      const response = await openai.chat.completions.create({
        model: openrouterModel,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You extract school project briefs. Return strict JSON only with keys: title, subject, grade, deadline, materials, complexity, confidence, summary.",
          },
          {
            role: "user",
            content: `Brief text:\n${extractedText || "(empty)"}`,
          },
        ],
      });
      raw = response.choices?.[0]?.message?.content ?? "";
    }

    const parsed = normalizeExtracted(safeParseJson(raw));
    if (!parsed.summary && extractedText) {
      parsed.summary = extractedText.slice(0, 280);
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(fallbackExtractFromText(extractedText));
  }
}
