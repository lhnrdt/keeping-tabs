DROP TABLE `person_keys`;--> statement-breakpoint
CREATE TABLE `person_keys` (
	`person_id` text NOT NULL,
	`key_id` text NOT NULL,
	`vault_id` text NOT NULL,
	`sealed` text NOT NULL,
	PRIMARY KEY(`person_id`, `key_id`, `vault_id`),
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
