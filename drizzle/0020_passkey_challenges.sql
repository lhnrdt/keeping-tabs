CREATE TABLE `passkey_challenges` (
	`challenge_hash` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
