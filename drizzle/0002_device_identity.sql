CREATE TABLE `device_links` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`key_hash` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `devices_person_idx` ON `devices` (`person_id`);--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `members` ADD `person_id` text REFERENCES people(id);--> statement-breakpoint
CREATE UNIQUE INDEX `members_group_person_unique` ON `members` (`group_id`,`person_id`) WHERE "members"."deleted_at" is null and "members"."person_id" is not null;