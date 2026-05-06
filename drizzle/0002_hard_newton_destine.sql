CREATE TABLE `citizenDelegates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ministryId` int NOT NULL,
	`delegateId` int,
	`delegateUserId` int,
	`votingMethod` enum('direct','delegate') NOT NULL DEFAULT 'direct',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `citizenDelegates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delegateVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`decisionId` int NOT NULL,
	`delegateId` int NOT NULL,
	`vote` enum('for','against') NOT NULL,
	`votesRepresented` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delegateVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delegates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ministryId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`bio` text,
	`values` text,
	`expertise` text,
	`profileImage` varchar(500),
	`endorsements` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delegates_id` PRIMARY KEY(`id`)
);
