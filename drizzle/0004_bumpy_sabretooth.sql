CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"image" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "worklog_members" (
	"worklog_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	CONSTRAINT "worklog_members_worklog_id_user_id_pk" PRIMARY KEY("worklog_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "worklogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "worklog_id" uuid;--> statement-breakpoint
ALTER TABLE "daily_entries" ADD COLUMN "worklog_id" uuid;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "worklog_id" uuid;--> statement-breakpoint
ALTER TABLE "worklog_members" ADD CONSTRAINT "worklog_members_worklog_id_worklogs_id_fk" FOREIGN KEY ("worklog_id") REFERENCES "public"."worklogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worklog_members" ADD CONSTRAINT "worklog_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_worklog_id_worklogs_id_fk" FOREIGN KEY ("worklog_id") REFERENCES "public"."worklogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_entries" ADD CONSTRAINT "daily_entries_worklog_id_worklogs_id_fk" FOREIGN KEY ("worklog_id") REFERENCES "public"."worklogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_worklog_id_worklogs_id_fk" FOREIGN KEY ("worklog_id") REFERENCES "public"."worklogs"("id") ON DELETE no action ON UPDATE no action;