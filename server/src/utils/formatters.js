const { format } = require("date-fns");
const { zonedTimeToUtc, utcToZonedTime } = require("date-fns-tz");

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @returns {string} Formatted currency string
 */
exports.formatCurrency = (amount, currencyCode = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};

/**
 * Adjusts a date to the specified timezone
 * @param {Date|string} date - The date to adjust
 * @param {string} timezone - The IANA timezone string (e.g., 'America/New_York')
 * @returns {Date} Adjusted date
 */
exports.adjustToTimezone = (date, timezone) => {
  const utcDate = zonedTimeToUtc(new Date(date), "UTC");
  return utcToZonedTime(utcDate, timezone);
};

/**
 * Formats a date according to the specified format and timezone
 * @param {Date|string} date - The date to format
 * @param {string} formatStr - The format string (default: 'yyyy-MM-dd HH:mm:ss')
 * @param {string} timezone - The IANA timezone string
 * @returns {string} Formatted date string
 */
exports.formatDate = (date, formatStr = "yyyy-MM-dd HH:mm:ss", timezone) => {
  const zonedDate = timezone
    ? utcToZonedTime(new Date(date), timezone)
    : new Date(date);
  return format(zonedDate, formatStr);
};
