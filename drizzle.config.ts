import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

function readDatabaseUrlFromDotEnv() {
  if (!existsSync(".env")) {
    return undefined;
  }

  const envContents = readFileSync(".env", "utf8");

  for (const rawLine of envContents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const [key, ...valueParts] = line.split("=");

    if (key !== "DATABASE_URL") {
      continue;
    }

    const value = valueParts.join("=").trim();
    return value.replace(/^['\"]|['\"]$/g, "");
  }

  return undefined;
}

const databaseUrl = process.env.DATABASE_URL ?? readDatabaseUrlFromDotEnv();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set.");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
