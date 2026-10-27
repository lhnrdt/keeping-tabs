ALTER TABLE `expenses` ADD `original_currency` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `original_amount_cents` integer;--> statement-breakpoint
ALTER TABLE `expenses` ADD `exchange_rate` text;