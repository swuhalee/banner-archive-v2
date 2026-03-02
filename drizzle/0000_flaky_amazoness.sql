CREATE TYPE "public"."banner_status" AS ENUM('active', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."ops_role" AS ENUM('ADMIN', 'EDITOR', 'AUDITOR');--> statement-breakpoint
CREATE TYPE "public"."region_kind" AS ENUM('sido', 'si', 'gun', 'gu', 'eup', 'myeon', 'dong', 'ri');--> statement-breakpoint
CREATE TYPE "public"."appeal_reason_type" AS ENUM('privacy', 'portrait', 'false_info', 'other');--> statement-breakpoint
CREATE TYPE "public"."appeal_status" AS ENUM('received', 'under_review', 'actioned', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."subject_type" AS ENUM('politician', 'party', 'other');--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"hashtags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"subject_type" "subject_type",
	"region_text" text NOT NULL,
	"region_id" integer,
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
CREATE TABLE "regions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "regions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"kind" "region_kind" NOT NULL,
	"parent_id" integer,
	"lat" real,
	"lng" real,
	"sido" text NOT NULL,
	"sigungu" text,
	"eupmyeondong" text,
	"full_path" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"banner_id" uuid NOT NULL,
	"reason_type" "appeal_reason_type" NOT NULL,
	"reason_detail" text,
	"status" "appeal_status" DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_parent_id_regions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "banners_region_text_idx" ON "banners" USING btree ("region_text");--> statement-breakpoint
CREATE INDEX "banners_subject_type_idx" ON "banners" USING btree ("subject_type");--> statement-breakpoint
CREATE INDEX "banners_status_idx" ON "banners" USING btree ("status");--> statement-breakpoint
CREATE INDEX "regions_parent_id_idx" ON "regions" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "regions_sido_idx" ON "regions" USING btree ("sido");--> statement-breakpoint
CREATE INDEX "regions_sigungu_idx" ON "regions" USING btree ("sigungu");