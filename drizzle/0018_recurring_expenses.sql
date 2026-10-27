CREATE TABLE `recurring_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`member_id` text,
	`template` text NOT NULL,
	`frequency` text NOT NULL,
	`added` integer DEFAULT 1 NOT NULL,
	`next_on` text NOT NULL,
	`created_at` integer NOT NULL,
	`stopped_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recurring_expenses_due_idx` ON `recurring_expenses` (`stopped_at`,`next_on`);