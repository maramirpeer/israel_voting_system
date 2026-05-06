CREATE TABLE `citizenVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` int NOT NULL,
	`userId` int NOT NULL,
	`vote` enum('for','against') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `citizenVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decisionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`details` json,
	`performedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decisionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ministryId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('major','medium','routine') NOT NULL DEFAULT 'medium',
	`status` enum('proposed','voting','approved','rejected','implemented') NOT NULL DEFAULT 'proposed',
	`proposedBy` int NOT NULL,
	`votingStartsAt` timestamp,
	`votingEndsAt` timestamp,
	`totalVoters` int DEFAULT 0,
	`votesFor` int DEFAULT 0,
	`votesAgainst` int DEFAULT 0,
	`vetoed` boolean DEFAULT false,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ministries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`color` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ministries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','minister') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `ministryId` int;