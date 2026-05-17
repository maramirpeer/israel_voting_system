CREATE TABLE `memberSignups` (
  `id` int AUTO_INCREMENT NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `nationalId` varchar(32) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(64),
  `note` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `memberSignups_id` PRIMARY KEY(`id`),
  CONSTRAINT `memberSignups_nationalId_unique` UNIQUE(`nationalId`),
  CONSTRAINT `memberSignups_email_unique` UNIQUE(`email`),
  CONSTRAINT `memberSignups_phone_unique` UNIQUE(`phone`)
);
