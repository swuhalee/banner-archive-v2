ALTER TABLE "appeals" RENAME TO "reports";--> statement-breakpoint
ALTER TABLE "reports" DROP CONSTRAINT "appeals_banner_id_banners_id_fk";
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;