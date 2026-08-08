CREATE TABLE "entry_clients" (
	"daily_entry_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	CONSTRAINT "entry_clients_daily_entry_id_client_id_pk" PRIMARY KEY("daily_entry_id","client_id")
);
--> statement-breakpoint
ALTER TABLE "entry_clients" ADD CONSTRAINT "entry_clients_daily_entry_id_daily_entries_id_fk" FOREIGN KEY ("daily_entry_id") REFERENCES "public"."daily_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entry_clients" ADD CONSTRAINT "entry_clients_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;