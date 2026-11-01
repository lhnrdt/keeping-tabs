ALTER TABLE `expenses` ADD `sealed_details` text;--> statement-breakpoint
ALTER TABLE `members` ADD `payment_details` text;--> statement-breakpoint
ALTER TABLE `passkeys` ADD `sealed_vault` text;--> statement-breakpoint
ALTER TABLE `people` ADD `sealed_payment_details` text;