CREATE TYPE "public"."appeal_reason_type" AS ENUM('privacy', 'portrait', 'false_info', 'other');--> statement-breakpoint
CREATE TYPE "public"."appeal_status" AS ENUM('received', 'under_review', 'actioned', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."banner_status" AS ENUM('active', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."masking_status" AS ENUM('pending', 'success', 'fail', 'review');--> statement-breakpoint
CREATE TYPE "public"."ops_role" AS ENUM('ADMIN', 'EDITOR', 'AUDITOR');--> statement-breakpoint
CREATE TYPE "public"."subject_type" AS ENUM('politician', 'party', 'other');--> statement-breakpoint
CREATE TABLE "appeals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"banner_id" uuid NOT NULL,
	"reason_type" "appeal_reason_type" NOT NULL,
	"reason_detail" text,
	"status" "appeal_status" DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"hashtags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"subject_type" "subject_type",
	"region_text" text NOT NULL,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"observed_count" integer DEFAULT 1 NOT NULL,
	"status" "banner_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"banner_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"masking_status" "masking_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ops_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "ops_role" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ops_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appeals" ADD CONSTRAINT "appeals_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;