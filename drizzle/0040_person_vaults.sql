CREATE TABLE `person_vaults` (
	`person_id` text NOT NULL,
	`vault_id` text NOT NULL,
	`public_key` text NOT NULL,
	`seen_at` integer NOT NULL,
	PRIMARY KEY(`person_id`, `vault_id`),
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
