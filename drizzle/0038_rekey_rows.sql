CREATE TABLE `rekey_rows` (
	`group_id` text NOT NULL,
	`kind` text NOT NULL,
	`row_id` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`group_id`, `kind`, `row_id`),
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade
);
