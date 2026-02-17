import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';
import { format as formatFns, startOfDay, endOfDay, addMinutes, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const TIMEZONE = 'America/Mexico_City';

// --- Core Timezone Converters ---

/**
 * Returns the current date/time in the target timezone.
 * Note: This returns a Date object that effectively represents the local time
 * in the target timezone (e.g., if it's 10:00 UTC and 04:00 Mexico, this returns 04:00).
 * Use cautiously with standard Date methods - treat it as a "representation".
 */
export function now() {
    return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Converts a UTC Date (from DB or new Date()) to the target timezone.
 * Useful for displaying dates.
 */
export function toZoned(date) {
    if (!date) return null;
    return toZonedTime(date, TIMEZONE);
}

/**
 * Converts a date representing local time in the target timezone back to UTC.
 * Useful for saving to DB.
 */
export function fromZoned(date) {
    if (!date) return null;
    return fromZonedTime(date, TIMEZONE);
}

// --- Formatting ---

/**
 * Formats a date using date-fns format, but ensuring it's in the target timezone.
 * If the input is a UTC date (e.g. from DB), it will be converted first.
 */
export function formatZoned(date, formatString) {
    if (!date) return '';
    // toZonedTime handles strings and Date objects.
    // However, formatTz from date-fns-tz might be cleaner if we use the timeZone option.
    // Let's use standard formatTz which is format(date, formatStr, { timeZone })
    return formatTz(date, formatString, { timeZone: TIMEZONE, locale: es });
}

// --- Date Math Helpers (preserving timezone context where needed) ---

/**
 * specific helpers for Agenda logic
 */

export function startOfDayZoned(date) {
    // 1. Convert input date to zoneless representation of the day in Mexico
    const zonedDate = toZoned(date);
    // 2. Get start of that day
    const start = startOfDay(zonedDate);
    // 3. IMPORTANT: The result of startOfDay on a zoned date logic might be tricky.
    // If we use date-fns startOfDay, it operates on local system time interpretation.

    // Better approach: string manipulation or using fromZonedTime?
    // Let's rely on date-fns-tz:
    // "2023-10-27 00:00:00" in Mexico

    // We can construct the datestring YYYY-MM-DD
    const isoDate = formatTz(zonedDate, 'yyyy-MM-dd', { timeZone: TIMEZONE });
    // Then create a date at 00:00 Mexico time
    const startZoned = fromZonedTime(`${isoDate} 00:00:00`, TIMEZONE);
    return startZoned; // This is a UTC date representing 00:00 Mexico
}

export function endOfDayZoned(date) {
    const zonedDate = toZoned(date);
    const isoDate = formatTz(zonedDate, 'yyyy-MM-dd', { timeZone: TIMEZONE });
    // Create date at 23:59:59.999 Mexico time
    const endZoned = fromZonedTime(`${isoDate} 23:59:59.999`, TIMEZONE);
    return endZoned;
}

/**
 * Parses a time string (HH:mm) on a specific date in the target timezone
 * and returns the corresponding UTC date.
 * @param {Date} referenceDate - The date context (e.g. current selected day)
 * @param {string} timeString - "14:30"
 */
export function parseTimeInZone(referenceDate, timeString) {
    if (!timeString) return null;
    const zonedBase = toZoned(referenceDate);
    const dateStr = formatTz(zonedBase, 'yyyy-MM-dd', { timeZone: TIMEZONE });
    // Combine YYYY-MM-DD + HH:mm:00
    // fromZonedTime treats the input string as belonging to the timezone
    return fromZonedTime(`${dateStr} ${timeString}:00`, TIMEZONE);
}

/**
 * Strips seconds and milliseconds from a Date object.
 * Ensures all booking timestamps align to exact minutes.
 * @param {Date|string} date
 * @returns {Date}
 */
export function normalizeToMinute(date) {
    const d = new Date(date);
    d.setSeconds(0, 0); // sets seconds AND milliseconds to 0
    return d;
}

// Re-export constants
export { es };
