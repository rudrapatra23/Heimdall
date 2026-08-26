CREATE TABLE "early_access_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"how_did_you_know" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "early_access_applications_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_early_access_applications_email" ON "early_access_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_early_access_applications_status" ON "early_access_applications" USING btree ("status");