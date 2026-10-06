import { readFileSync } from "node:fs";
import pg from "pg";

const { Pool } = pg;

function readEnvValue(key) {
  for (const fileName of [".env.local", ".env"]) {
    let contents;

    try {
      contents = readFileSync(fileName, "utf8");
    } catch {
      continue;
    }

    for (const rawLine of contents.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const separator = line.indexOf("=");
      if (separator < 0 || line.slice(0, separator).trim() !== key) continue;

      const value = line.slice(separator + 1).trim();
      return value.replace(/^['"]|['"]$/g, "");
    }
  }

  return undefined;
}

const databaseUrl = process.env.DATABASE_URL ?? readEnvValue("DATABASE_URL");
const ownerUserId =
  process.env.LEGACY_WORKLOG_OWNER_ID ??
  readEnvValue("LEGACY_WORKLOG_OWNER_ID");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

if (!ownerUserId) {
  throw new Error(
    "Set LEGACY_WORKLOG_OWNER_ID to an existing Auth.js users.id.",
  );
}

const pool = new Pool({ connectionString: databaseUrl });
const client = await pool.connect();

try {
  await client.query("BEGIN");

  const owner = await client.query("SELECT id FROM users WHERE id = $1", [
    ownerUserId,
  ]);
  if (owner.rowCount !== 1) {
    throw new Error("LEGACY_WORKLOG_OWNER_ID does not match an existing user.");
  }

  const duplicateMemberships = await client.query(
    "SELECT user_id FROM worklog_members GROUP BY user_id HAVING count(*) > 1 LIMIT 1",
  );
  if (duplicateMemberships.rowCount > 0) {
    throw new Error("A user already belongs to multiple worklogs.");
  }

  const existingMembership = await client.query(
    "SELECT worklog_id FROM worklog_members WHERE user_id = $1",
    [ownerUserId],
  );
  let worklogId = existingMembership.rows[0]?.worklog_id;

  if (existingMembership.rowCount > 1) {
    throw new Error("The configured owner belongs to multiple worklogs.");
  }

  if (!worklogId) {
    const worklog = await client.query(
      "INSERT INTO worklogs (name) VALUES ($1) RETURNING id",
      ["Personal worklog"],
    );
    worklogId = worklog.rows[0].id;

    await client.query(
      "INSERT INTO worklog_members (worklog_id, user_id, role) VALUES ($1, $2, $3)",
      [worklogId, ownerUserId, "owner"],
    );
  }

  for (const tableName of ["clients", "projects", "daily_entries"]) {
    await client.query(
      `UPDATE ${tableName} SET worklog_id = $1 WHERE worklog_id IS NULL`,
      [worklogId],
    );
  }

  const unassigned = await client.query(`
    SELECT
      (SELECT count(*) FROM clients WHERE worklog_id IS NULL) +
      (SELECT count(*) FROM projects WHERE worklog_id IS NULL) +
      (SELECT count(*) FROM daily_entries WHERE worklog_id IS NULL) AS count
  `);

  if (Number(unassigned.rows[0].count) !== 0) {
    throw new Error("Some records remain without a worklog owner.");
  }

  await client.query("COMMIT");
  console.info("Existing unowned records were assigned successfully.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
