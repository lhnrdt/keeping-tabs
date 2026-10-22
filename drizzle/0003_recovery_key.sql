ALTER TABLE `people` ADD `recovery_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `people_recovery_hash_unique` ON `people` (`recovery_hash`);