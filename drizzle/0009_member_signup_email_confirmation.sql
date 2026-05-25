ALTER TABLE `memberSignups` ADD COLUMN `emailConfirmedAt` timestamp;
ALTER TABLE `memberSignups` ADD COLUMN `confirmationTokenHash` varchar(64);
ALTER TABLE `memberSignups` ADD COLUMN `confirmationSentAt` timestamp;
ALTER TABLE `memberSignups` ADD COLUMN `welcomeEmailSentAt` timestamp;
ALTER TABLE `memberSignups` ADD COLUMN `notificationSentAt` timestamp;
