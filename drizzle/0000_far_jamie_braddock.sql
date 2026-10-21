CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`member_id` text,
	`action` text NOT NULL,
	`payload` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `activity_log_group_created_idx` ON `activity_log` (`group_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `expense_splits` (
	`expense_id` text NOT NULL,
	`member_id` text NOT NULL,
	`share_cents` integer NOT NULL,
	`input` integer,
	PRIMARY KEY(`expense_id`, `member_id`),
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `expense_splits_member_idx` ON `expense_splits` (`member_id`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`paid_by` text NOT NULL,
	`date` text NOT NULL,
	`split_mode` text DEFAULT 'equal' NOT NULL,
	`notes` text,
	`category` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paid_by`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "expenses_amount_positive" CHECK("expenses"."amount_cents" > 0)
);
--> statement-breakpoint
CREATE INDEX `expenses_group_date_idx` ON `expenses` (`group_id`,`date`);--> statement-breakpoint
CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`share_token` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `groups_share_token_unique` ON `groups` (`share_token`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_group_name_unique` ON `members` (`group_id`,`name`) WHERE "members"."deleted_at" is null;