CREATE TABLE `audit_events` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`owner_id` text NOT NULL,
	`actor` text NOT NULL,
	`kind` text NOT NULL,
	`entity` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audit_events_id_unique` ON `audit_events` (`id`);--> statement-breakpoint
CREATE INDEX `audit_owner_seq` ON `audit_events` (`owner_id`,`seq`);