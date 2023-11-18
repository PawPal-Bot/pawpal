module.exports = {
  now: () => Date.now(), // current time

  // calculate time
  oneMinute: () => 1 * 60 * 1000, // 1 minute = 60000 milliseconds
  fiveMinutes: () => 5 * 60 * 1000, // 5 minutes = 300000 milliseconds
  tenMinutes: () => 10 * 60 * 1000, // 10 minutes = 600000 milliseconds
  fifteenMinutes: () => 15 * 60 * 1000, // 15 minutes = 900000 milliseconds
  thirtyMinutes: () => 30 * 60 * 1000, // 30 minutes = 1800000 milliseconds
  oneHour: () => 1 * 60 * 60 * 1000, // 1 hour = 3600000 milliseconds
  twoHours: () => 2 * 60 * 60 * 1000, // 2 hours = 7200000 milliseconds
  threeHours: () => 3 * 60 * 60 * 1000, // 3 hours = 10800000 milliseconds
  fourHours: () => 4 * 60 * 60 * 1000, // 4 hours = 14400000 milliseconds
  fiveHours: () => 5 * 60 * 60 * 1000, // 5 hours = 18000000 milliseconds
  sixHours: () => 6 * 60 * 60 * 1000, // 6 hours = 21600000 milliseconds
  sevenHours: () => 7 * 60 * 60 * 1000, // 7 hours = 25200000 milliseconds
  eightHours: () => 8 * 60 * 60 * 1000, // 8 hours = 28800000 milliseconds
  nineHours: () => 9 * 60 * 60 * 1000, // 9 hours = 32400000 milliseconds
  tenHours: () => 10 * 60 * 60 * 1000, // 10 hours = 36000000 milliseconds
  elevenHours: () => 11 * 60 * 60 * 1000, // 11 hours = 39600000 milliseconds
  twelveHours: () => 12 * 60 * 60 * 1000, // 12 hours = 43200000 milliseconds
  oneDay: () => 24 * 60 * 60 * 1000, // 1 day = 86400000 milliseconds
  twoDays: () => 2 * 24 * 60 * 60 * 1000, // 2 days = 172800000 milliseconds
  threeDays: () => 3 * 24 * 60 * 60 * 1000, // 3 days = 259200000 milliseconds
  fourDays: () => 4 * 24 * 60 * 60 * 1000, // 4 days = 345600000 milliseconds
  fiveDays: () => 5 * 24 * 60 * 60 * 1000, // 5 days = 432000000 milliseconds
  sixDays: () => 6 * 24 * 60 * 60 * 1000, // 6 days = 518400000 milliseconds
  oneWeek: () => 7 * 24 * 60 * 60 * 1000, // 1 week = 604800000 milliseconds

  // past time
  oneMinuteAgo: () => Date.now() - 1 * 60 * 1000,
  fiveMinutesAgo: () => Date.now() - 5 * 60 * 1000,
  tenMinutesAgo: () => Date.now() - 10 * 60 * 1000,
  fifteenMinutesAgo: () => Date.now() - 15 * 60 * 1000,
  thirtyMinutesAgo: () => Date.now() - 30 * 60 * 1000,
  oneHourAgo: () => Date.now() - 1 * 60 * 60 * 1000,
  twoHoursAgo: () => Date.now() - 2 * 60 * 60 * 1000,
  threeHoursAgo: () => Date.now() - 3 * 60 * 60 * 1000,
  fourHoursAgo: () => Date.now() - 4 * 60 * 60 * 1000,
  fiveHoursAgo: () => Date.now() - 5 * 60 * 60 * 1000,
  sixHoursAgo: () => Date.now() - 6 * 60 * 60 * 1000,
  sevenHoursAgo: () => Date.now() - 7 * 60 * 60 * 1000,
  eightHoursAgo: () => Date.now() - 8 * 60 * 60 * 1000,
  nineHoursAgo: () => Date.now() - 9 * 60 * 60 * 1000,
  tenHoursAgo: () => Date.now() - 10 * 60 * 60 * 1000,
  elevenHoursAgo: () => Date.now() - 11 * 60 * 60 * 1000,
  twelveHoursAgo: () => Date.now() - 12 * 60 * 60 * 1000,
  oneDayAgo: () => Date.now() - 24 * 60 * 60 * 1000,
  twoDaysAgo: () => Date.now() - 2 * 24 * 60 * 60 * 1000,
  threeDaysAgo: () => Date.now() - 3 * 24 * 60 * 60 * 1000,
  fourDaysAgo: () => Date.now() - 4 * 24 * 60 * 60 * 1000,
  fiveDaysAgo: () => Date.now() - 5 * 24 * 60 * 60 * 1000,
  sixDaysAgo: () => Date.now() - 6 * 24 * 60 * 60 * 1000,
  oneWeekAgo: () => Date.now() - 7 * 24 * 60 * 60 * 1000,
};
