ALTER TABLE "clients" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp;