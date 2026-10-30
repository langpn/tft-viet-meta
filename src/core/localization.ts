const numericPattern = /\d+(?:\.\d+)?%?/g;

export function normalizeVietnamese(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export type TranslationValidation = {
  ok: boolean;
  errors: string[];
};

export function validateTranslation(
  original: string,
  translation: string,
): TranslationValidation {
  const originalNumbers = original.match(numericPattern) ?? [];
  const translatedNumbers = translation.match(numericPattern) ?? [];
  const errors: string[] = [];

  if (originalNumbers.join("|") !== translatedNumbers.join("|")) {
    errors.push("numeric values changed");
  }

  return { ok: errors.length === 0, errors };
}
