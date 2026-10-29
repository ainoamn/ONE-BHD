const AR_TO_EN: Record<string, string> = {
  ا: "a",
  أ: "a",
  إ: "i",
  آ: "aa",
  ء: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "dh",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  ة: "a",
  و: "w",
  ي: "y",
  ى: "a",
  ئ: "i",
  ؤ: "u",
  " ": " ",
  "-": "-",
};

const EN_MULTI: Array<[string, string]> = [
  ["kh", "خ"],
  ["gh", "غ"],
  ["sh", "ش"],
  ["th", "ث"],
  ["dh", "ذ"],
  ["aa", "ا"],
  ["ee", "ي"],
  ["oo", "و"],
  ["ph", "ف"],
];

const EN_TO_AR: Record<string, string> = {
  a: "ا",
  b: "ب",
  c: "ك",
  d: "د",
  e: "ي",
  f: "ف",
  g: "ج",
  h: "ه",
  i: "ي",
  j: "ج",
  k: "ك",
  l: "ل",
  m: "م",
  n: "ن",
  o: "و",
  p: "ب",
  q: "ق",
  r: "ر",
  s: "س",
  t: "ت",
  u: "و",
  v: "ف",
  w: "و",
  x: "كس",
  y: "ي",
  z: "ز",
  " ": " ",
  "-": "-",
};

export function hasArabic(value: string) {
  return /[\u0600-\u06FF]/.test(value);
}

export function hasLatin(value: string) {
  return /[A-Za-z]/.test(value);
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function transliterateArToEn(value: string) {
  const out = [...value]
    .map((ch) => AR_TO_EN[ch] ?? (/\s/.test(ch) ? " " : ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return titleCase(out);
}

export function transliterateEnToAr(value: string) {
  let rest = value.toLowerCase();
  let out = "";
  while (rest) {
    const multi = EN_MULTI.find(([latin]) => rest.startsWith(latin));
    if (multi) {
      out += multi[1];
      rest = rest.slice(multi[0].length);
      continue;
    }
    const ch = rest[0];
    out += EN_TO_AR[ch] ?? (/[\d]/.test(ch) ? ch : "");
    rest = rest.slice(1);
  }
  return out.replace(/\s+/g, " ").trim();
}

export function localNamePair(source: string): { ar: string; en: string } {
  const text = source.trim();
  const arabic = hasArabic(text);
  const latin = hasLatin(text);
  if (arabic && !latin) return { ar: text, en: transliterateArToEn(text) };
  if (latin && !arabic) return { ar: transliterateEnToAr(text), en: titleCase(text) };
  return {
    ar: arabic ? text : transliterateEnToAr(text),
    en: latin ? titleCase(text) : transliterateArToEn(text),
  };
}
