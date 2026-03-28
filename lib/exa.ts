import Exa from "exa-js";

export const hasExa = Boolean(process.env.EXA_API_KEY);

let exaInstance: Exa | null = null;

export const getExa = (): Exa | null => {
  if (process.env.EXA_API_KEY) {
    if (!exaInstance) {
      exaInstance = new Exa(process.env.EXA_API_KEY);
    }
    return exaInstance;
  }
  return null;
};

// For backwards compatibility
export const exa = {
  searchAndContents: async (params: any) => {
    const client = getExa();
    if (!client) throw new Error("Exa API key not configured");
    return client.searchAndContents(params);
  },
  search: async (params: any) => {
    const client = getExa();
    if (!client) throw new Error("Exa API key not configured");
    return client.search(params);
  },
} as any;
