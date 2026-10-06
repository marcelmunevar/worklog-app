ALTER TABLE "clients" DROP CONSTRAINT IF EXISTS "clients_name_unique";--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "worklog_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_entries" ALTER COLUMN "worklog_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "worklog_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_worklog_id_name_unique" UNIQUE("worklog_id","name");--> statement-breakpoint
ALTER TABLE "worklog_members" ADD CONSTRAINT "worklog_members_user_id_unique" UNIQUE("user_id");