const { format } = require("date-fns");

/**
 * Formats a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @returns {string} Formatted currency string
 */
exports.formatCurrency = (amount, currencyCode = "USD") => {
  // Vérifie que le montant est un nombre
  if (typeof amount !== "number") {
    throw new Error("Le montant doit être un nombre.");
  }

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
  if (!timezone) {
    throw new Error("Le fuseau horaire doit être spécifié.");
  }
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) {
    throw new Error("Date invalide.");
  }
  // Get the target timezone's offset in minutes
  const targetOffset = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  })
    .format(inputDate)
    .split(" ")[1];
  // Parse the offset string to minutes
  const offsetMinutes = parseOffset(targetOffset);
  // Adjust the date
  const adjustedDate = new Date(inputDate.getTime() + offsetMinutes * 60000);
  return adjustedDate;
};

/**
 * Parse timezone offset string to minutes
 * @param {string} offset - Timezone offset string (e.g., 'GMT-0400')
 * @returns {number} Offset in minutes
 */
function parseOffset(offset) {
  const match = offset.match(/GMT([+-])(\d{2})(\d{2})/);
  if (!match) return 0;

  const [, sign, hours, minutes] = match;
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
  return sign === "-" ? totalMinutes : -totalMinutes;
}

/**
 * Formats a date according to the specified format and timezone
 * @param {Date|string} date - The date to format
 * @param {string} formatStr - The format string (default: 'yyyy-MM-dd HH:mm:ss')
 * @param {string} timezone - The IANA timezone string
 * @returns {string} Formatted date string
 */
exports.formatDate = (date, formatStr = "yyyy-MM-dd HH:mm:ss", timezone) => {
  // Vérifier si une date valide est fournie
  const validDate = new Date(date);
  if (isNaN(validDate.getTime())) {
    throw new Error("Date invalide.");
  }

  // Appliquer le fuseau horaire si fourni
  const zonedDate = timezone ? utcToZonedTime(validDate, timezone) : validDate;

  // Retourner la date formatée
  return format(zonedDate, formatStr);
};
