import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

export const hasOpenAI = !!process.env.OPENROUTER_API_KEY;
export const openrouterModel = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export const getOpenai = (): OpenAI | null => {
  if (process.env.OPENROUTER_API_KEY) {
    if (!openaiInstance) {
      openaiInstance = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": "Pahechan",
        },
      });
    }
    return openaiInstance;
  }
  return null;
};

// For backwards compatibility, create a lazy-loaded export
export const openai = {
  responses: {
    create: async (params: any) => {
      const client = getOpenai();
      if (!client) throw new Error("OpenAI not configured");
      return (client as any).responses.create(params);
    },
  },
  chat: {
    completions: {
      create: async (params: any) => {
        const client = getOpenai();
        if (!client) throw new Error("OpenAI not configured");
        return client.chat.completions.create(params);
      },
    },
  },
} as any;
