import { ApifyClient } from "apify-client";

export const hasApify = Boolean(process.env.APIFY_TOKEN);

let apifyInstance: ApifyClient | null = null;

export const getApify = (): ApifyClient | null => {
  if (process.env.APIFY_TOKEN) {
    if (!apifyInstance) {
      apifyInstance = new ApifyClient({ token: process.env.APIFY_TOKEN });
    }
    return apifyInstance;
  }
  return null;
};

// For backwards compatibility
export const apify = {
  actor: (actorId: string) => {
    const client = getApify();
    if (!client) throw new Error("Apify token not configured");
    return client.actor(actorId);
  },
} as any;
