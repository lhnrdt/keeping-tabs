CREATE TABLE `person_keys` (
	`person_id` text NOT NULL,
	`key_id` text NOT NULL,
	`sealed` text NOT NULL,
	PRIMARY KEY(`person_id`, `key_id`),
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `expenses` ADD `auto_category` text;--> statement-breakpoint
ALTER TABLE `groups` ADD `key_id` text;--> statement-breakpoint
ALTER TABLE `people` ADD `recovery_vault` text;