import type { Config } from "drizzle-kit";
import { requireEnv } from "@/lib/env";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: requireEnv("DATABASE_URL"),
  },
} satisfies Config;
