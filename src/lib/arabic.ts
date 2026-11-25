/** Arabic-aware text normalisation used by search.
 *  - strips diacritics (tashkeel, superscript alef) and tatweel
 *  - folds alef variants (أ إ آ ٱ) to ا
 *  - folds ى → ي and ة → ه, ؤ → و, ئ → ي
 *  - converts Arabic-Indic / Persian digits to ASCII
 *  - lowercases Latin and collapses whitespace */
export function normalize(input: string): string {
  return (input || '')
    .normalize('NFKC')
    .replace(/[ً-ٰٟۖ-ۭ]/g, '')
    .replace(/ـ/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** All query tokens must appear (as substrings) in the haystack. */
export function matches(haystackNormalized: string, query: string): boolean {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (!tokens.length) return true;
  return tokens.every((t) => haystackNormalized.includes(t));
}
