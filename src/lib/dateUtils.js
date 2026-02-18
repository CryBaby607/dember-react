import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';

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
    const zonedDate = toZoned(date);
    const isoDate = formatTz(zonedDate, 'yyyy-MM-dd', { timeZone: TIMEZONE });
    return fromZonedTime(`${isoDate} 00:00:00`, TIMEZONE);
}

export function endOfDayZoned(date) {
    const zonedDate = toZoned(date);
    const isoDate = formatTz(zonedDate, 'yyyy-MM-dd', { timeZone: TIMEZONE });
    // Create date at 23:59:59.999 Mexico time
    const endZoned = fromZonedTime(`${isoDate} 23:59:59.999`, TIMEZONE);
    return endZoned;
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
