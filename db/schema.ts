import { pgTable, uuid, text, timestamp, date } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull().unique(),

  acronym: text("acronym"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  description: text("description"),

  status: text("status").notNull().default("active"),

  createdAt: timestamp("created_at").defaultNow(),

  updatedAt: timestamp("updated_at").defaultNow(),
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

  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),

  title: text("title").notNull(),

  description: text("description"),

  workDate: date("work_date").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
