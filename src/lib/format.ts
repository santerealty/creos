/**
 * Insert thousands separators into every currency figure in a string.
 * Only affects numbers that directly follow a `$` (so years, unit counts,
 * percentages, and already-formatted values like "$1,350" are left alone).
 * Decimal fractions and K/M/B suffixes are preserved.
 *   "$2148K"   -> "$2,148K"
 *   "$1188K"   -> "$1,188K"
 *   "$960K"    -> "$960K"     (unchanged, < 1000)
 *   "$27.3M"   -> "$27.3M"    (unchanged, integer part < 1000)
 *   "$1,350"   -> "$1,350"    (unchanged, already comma-separated)
 */
export function withThousands(text: string | number | undefined | null): string {
  const str = String(text ?? '');
  return str.replace(/\$(\d+)/g, (_m, digits: string) =>
    '$' + Number(digits).toLocaleString('en-US')
  );
}
