CREATE TABLE `mk121BillSupporters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`billId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mk121BillSupporters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mk121QuestionSupporters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mk121QuestionSupporters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mk121Bills` ADD `status` enum('preliminary','voting','approved','archived') DEFAULT 'preliminary' NOT NULL;--> statement-breakpoint
ALTER TABLE `mk121Bills` ADD `supporters` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `mk121Bills` ADD `quorumMet` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `mk121Bills` ADD `createdCycleNumber` int NOT NULL;--> statement-breakpoint
ALTER TABLE `mk121Bills` ADD `archivedAt` timestamp;--> statement-breakpoint
ALTER TABLE `mk121Questions` ADD `status` enum('preliminary','voting','approved','archived') DEFAULT 'preliminary' NOT NULL;--> statement-breakpoint
ALTER TABLE `mk121Questions` ADD `supporters` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `mk121Questions` ADD `quorumMet` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `mk121Questions` ADD `createdCycleNumber` int NOT NULL;--> statement-breakpoint
ALTER TABLE `mk121Questions` ADD `archivedAt` timestamp;