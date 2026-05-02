import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { requireEnv } from "@/lib/env";

const connectionString = requireEnv("DATABASE_URL");

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
