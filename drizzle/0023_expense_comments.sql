CREATE TABLE `expense_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`expense_id` text NOT NULL,
	`member_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `expense_comments_expense_idx` ON `expense_comments` (`expense_id`,`created_at`);