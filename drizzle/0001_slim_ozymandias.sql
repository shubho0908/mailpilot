CREATE TABLE "gmail_sync_state" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email_address" text NOT NULL,
	"history_id" text NOT NULL,
	"watch_expiration" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gmail_sync_state" ADD CONSTRAINT "gmail_sync_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gmail_sync_state_emailAddress_idx" ON "gmail_sync_state" USING btree ("email_address");--> statement-breakpoint
CREATE INDEX "gmail_sync_state_watchExpiration_idx" ON "gmail_sync_state" USING btree ("watch_expiration");