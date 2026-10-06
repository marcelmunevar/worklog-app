import {
  date,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),

  name: text("name"),

  email: text("email").unique(),

  emailVerified: timestamp("email_verified"),

  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: text("type").notNull(),

    provider: text("provider").notNull(),

    providerAccountId: text("provider_account_id").notNull(),

    refresh_token: text("refresh_token"),

    access_token: text("access_token"),

    expires_at: integer("expires_at"),

    token_type: text("token_type"),

    scope: text("scope"),

    id_token: text("id_token"),

    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),

    token: text("token").notNull(),

    expires: timestamp("expires").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.identifier, table.token],
    }),
  ],
);

export const worklogs = pgTable("worklogs", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
});

export const worklogMembers = pgTable(
  "worklog_members",
  {
    worklogId: uuid("worklog_id")
      .notNull()
      .references(() => worklogs.id),

    userId: text("user_id")
      .notNull()
      .references(() => users.id),

    role: text("role").notNull().default("owner"),
  },
  (table) => [
    primaryKey({
      columns: [table.worklogId, table.userId],
    }),
  ],
);

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),

  worklogId: uuid("worklog_id").references(() => worklogs.id),

  name: text("name").notNull().unique(),

  acronym: text("acronym"),

  createdAt: timestamp("created_at").defaultNow(),

  deletedAt: timestamp("deleted_at"),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  worklogId: uuid("worklog_id").references(() => worklogs.id),

  name: text("name").notNull(),

  description: text("description"),

  status: text("status").notNull().default("active"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),

  deletedAt: timestamp("deleted_at"),
});

export const projectClients = pgTable("project_clients", {
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),

  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id),
});

export const dailyEntries = pgTable("daily_entries", {
  id: uuid("id").defaultRandom().primaryKey(),

  worklogId: uuid("worklog_id").references(() => worklogs.id),

  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),

  title: text("title").notNull(),

  description: text("description"),

  workDate: date("work_date").notNull(),

  createdAt: timestamp("created_at").defaultNow(),

  deletedAt: timestamp("deleted_at"),
});

export const entryClients = pgTable(
  "entry_clients",
  {
    dailyEntryId: uuid("daily_entry_id")
      .notNull()
      .references(() => dailyEntries.id),

    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
  },
  (table) => [
    primaryKey({
      columns: [table.dailyEntryId, table.clientId],
    }),
  ],
);
