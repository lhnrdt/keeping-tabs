ALTER TABLE `activity_log` ADD `sealed_actor` text;--> statement-breakpoint
ALTER TABLE `groups` ADD `encrypt_tried_at` integer;--> statement-breakpoint
ALTER TABLE `members` ADD `key_received` integer DEFAULT false NOT NULL;