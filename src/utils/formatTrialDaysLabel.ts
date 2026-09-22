/**
 * formatTrialDaysLabel.ts
 * Returns a pluralized days label without relying on Intl.PluralRules (not available in Hermes).
 */

export function formatTrialDaysLabel(count: number, locale: string): string {
  const lang = locale.split('-')[0];
  const n = count;

  // Slavic plural rules (ru, uk, be)
  const slavic = (one: string, few: string, many: string) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`;
    return `${n} ${many}`;
  };

  switch (lang) {
    case 'ru':
      return slavic('день', 'дня', 'дней');
    case 'uk':
      return slavic('день', 'дні', 'днів');
    case 'pl':
      return slavic('dzień', 'dni', 'dni');
    case 'ar':
      return n === 1 ? `يوم ${n}` : `${n} أيام`;
    case 'fr':
      return n === 1 ? `${n} jour` : `${n} jours`;
    case 'it':
      return n === 1 ? `${n} giorno` : `${n} giorni`;
    case 'es':
      return n === 1 ? `${n} día` : `${n} días`;
    case 'pt':
      return n === 1 ? `${n} dia` : `${n} dias`;
    case 'tr':
      return `${n} Gün`;
    case 'fa':
      return `${n} روز`;
    default:
      return n === 1 ? `${n} day` : `${n} days`;
  }
}
