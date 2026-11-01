PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_person_keys` (
	`person_id` text NOT NULL,
	`key_id` text NOT NULL,
	`vault_id` text NOT NULL,
	`sealed` text NOT NULL,
	PRIMARY KEY(`person_id`, `key_id`, `vault_id`),
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_person_keys`("person_id", "key_id", "vault_id", "sealed") SELECT "person_id", "key_id", "vault_id", "sealed" FROM `person_keys`;--> statement-breakpoint
DROP TABLE `person_keys`;--> statement-breakpoint
ALTER TABLE `__new_person_keys` RENAME TO `person_keys`;--> statement-breakpoint
PRAGMA foreign_keys=ON;