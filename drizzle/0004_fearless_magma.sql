CREATE TABLE `publicVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` int NOT NULL,
	`userId` int NOT NULL,
	`vote` enum('for','against') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publicVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `decisions` ADD `budget` decimal(12,2);--> statement-breakpoint
ALTER TABLE `decisions` ADD `publicVotingStartsAt` timestamp;--> statement-breakpoint
ALTER TABLE `decisions` ADD `publicVotingEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `decisions` ADD `publicVotesFor` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `decisions` ADD `publicVotesAgainst` int DEFAULT 0;