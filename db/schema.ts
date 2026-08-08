import {
  date,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull().unique(),

  acronym: text("acronym"),

  createdAt: timestamp("created_at").defaultNow(),

  deletedAt: timestamp("deleted_at"),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

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
  (table) => [primaryKey({ columns: [table.dailyEntryId, table.clientId] })],
);

export const dailyEntries = pgTable("daily_entries", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),

  title: text("title").notNull(),

  description: text("description"),

  workDate: date("work_date").notNull(),

  createdAt: timestamp("created_at").defaultNow(),

  deletedAt: timestamp("deleted_at"),
});
