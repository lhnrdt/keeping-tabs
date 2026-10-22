ALTER TABLE `expenses` ADD `import_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `expenses_group_import_key_idx` ON `expenses` (`group_id`,`import_key`);