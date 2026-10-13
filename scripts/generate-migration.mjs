import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const nameIndex = args.findIndex(
  (arg) => arg === "--name" || arg.startsWith("--name="),
);
const name =
  nameIndex === -1
    ? ""
    : args[nameIndex].startsWith("--name=")
      ? args[nameIndex].slice("--name=".length)
      : (args[nameIndex + 1] ?? "");

if (!name.trim() || name.startsWith("--")) {
  console.error(
    "A descriptive migration name is required.\n" +
      "Usage: npm run db:generate -- --name add_entry_notes",
  );
  process.exit(1);
}

const result = spawnSync("npx", ["drizzle-kit", "generate", ...args], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
