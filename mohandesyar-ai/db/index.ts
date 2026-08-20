import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export async function getDb() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  return drizzle(env.DB, { schema });
}
