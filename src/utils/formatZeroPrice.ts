/**
 * Returns the decimal separator for a given locale (e.g. "," for ru/de/fr/es, "." for en).
 */
export function getLocaleDecimalSeparator(locale?: string): string {
  try {
    const parts = new Intl.NumberFormat(locale || 'en').formatToParts(1.1);
    return parts.find(part => part.type === 'decimal')?.value || '.';
  } catch {
    return '.';
  }
}

/**
 * Formats a price string with exactly one non-breaking space between the
 * currency symbol and the number, preserving whether the currency symbol
 * is on the left or on the right, and aligning the decimal separator with the active locale.
 */
export function cleanPriceString(priceString?: string, locale?: string): string {
  if (!priceString) {
    return '';
  }
  let formatted = priceString
    .replace(/([^\d\s\u00A0.,])[\s\u00A0]*(?=\d)/g, '$1\u00A0')
    .replace(/(\d)[\s\u00A0]*([^\d\s\u00A0.,])/g, '$1\u00A0$2');

  if (locale) {
    const decimalSeparator = getLocaleDecimalSeparator(locale);
    formatted = formatted.replace(/(\d+)[.,](\d{2})(?!\d)/, `$1${decimalSeparator}$2`);
  }

  return formatted;
}

/**
 * Formats a zero-price string (e.g. "US$ 0", "$ 0", "0 €", "0 ₽") inheriting
 * the exact currency symbol and position (left/right) from a StoreKit/Google Play priceString,
 * with a non-breaking space between the currency and number.
 */
export function formatZeroPrice(priceString?: string, locale?: string): string {
  if (!priceString) {
    return 'US$\u00A00';
  }
  const withSpace = cleanPriceString(priceString, locale);
  return withSpace.replace(/\d([\d\s\u00A0,.]*\d)?/, '0');
}
