UPDATE `memberSignups`
SET `emailConfirmedAt` = NULL
WHERE `emailConfirmedAt` IS NOT NULL
  AND `confirmationSentAt` IS NULL
  AND `welcomeEmailSentAt` IS NULL
  AND `notificationSentAt` IS NULL;
