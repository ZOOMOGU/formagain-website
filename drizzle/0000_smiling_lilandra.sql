CREATE TABLE `subscribers` (
	`email` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`consent_version` text NOT NULL,
	`token_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_token_hash_unique` ON `subscribers` (`token_hash`);