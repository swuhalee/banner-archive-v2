CREATE INDEX "banners_region_text_idx" ON "banners" USING btree ("region_text");--> statement-breakpoint
CREATE INDEX "banners_subject_type_idx" ON "banners" USING btree ("subject_type");--> statement-breakpoint
CREATE INDEX "banners_status_idx" ON "banners" USING btree ("status");