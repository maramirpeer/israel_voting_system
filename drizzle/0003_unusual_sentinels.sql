CREATE TABLE `mk121BillVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`billId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mk121BillVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mk121Bills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`proposedBy` int NOT NULL,
	`category` varchar(100),
	`votes` int DEFAULT 0,
	`isWinner` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mk121Bills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mk121Cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleNumber` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`status` enum('active','completed','archived') NOT NULL DEFAULT 'active',
	`winningBillId` int,
	`winningQuestionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mk121Cycles_id` PRIMARY KEY(`id`),
	CONSTRAINT `mk121Cycles_cycleNumber_unique` UNIQUE(`cycleNumber`)
);
--> statement-breakpoint
CREATE TABLE `mk121QuestionVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mk121QuestionVotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mk121Questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cycleId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`targetMinistry` varchar(255),
	`proposedBy` int NOT NULL,
	`urgency` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`votes` int DEFAULT 0,
	`isWinner` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mk121Questions_id` PRIMARY KEY(`id`)
);
