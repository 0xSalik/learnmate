import type { AuthConfig } from "convex/server";

const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN?.replace(/\/$/, "");

export default {
  providers: issuer
    ? [
        {
          domain: issuer,
          applicationID: "convex",
        },
      ]
    : [],
} satisfies AuthConfig;
