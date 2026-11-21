/**
 * Contact form spam scoring. Pure functions, no I/O, so they are unit-testable.
 *
 * Design rule: a genuine inquiry must never be lost. Only overwhelming evidence
 * (honeypot filled, sub-1.2s submit, or a score of DROP_AT or more) is dropped.
 * Borderline scores are still delivered, tagged so a person can triage them.
 * Words a worried family might genuinely use (casino, gambling, pills, loan)
 * are deliberately NOT on the phrase list.
 */

export const MIN_HUMAN_MS = 1200;
export const FAST_MS = 4000;
export const FLAG_AT = 3;
export const DROP_AT = 7;

export type SpamAction = 'allow' | 'flag' | 'drop';
export type SpamVerdict = { score: number; reasons: string[]; action: SpamAction };
export type SpamMeta = { honeypot?: string; elapsedMs?: number };

// Commercial solicitation phrases that essentially never appear in a family's
// message to an interventionist.
const SPAM_PHRASES: RegExp[] = [
  /\bseo (services?|expert|agency|packages?|audit)\b/i,
  /\bbacklinks?\b/i,
  /\bguest post/i,
  /\brank (your|ur) (website|site)\b/i,
  /\bfirst page of google\b/i,
  /\b(buy|get) (more )?(followers|likes|traffic)\b/i,
  /\bweb ?(site)? (design|development) (services?|company|agency)\b/i,
  /\bdigital marketing (services?|agency|company)\b/i,
  /\bincrease your (traffic|sales|revenue|leads)\b/i,
  /\b(crypto|bitcoin|forex) (invest|trading|profit|signals?)/i,
  /\b(viagra|cialis)\b/i,
  /\bwork from home\b/i,
  /\bmake money online\b/i,
  /\bclick here\b/i,
  /\blimited time offer\b/i,
  /\bdear (sir|madam|webmaster|business owner)\b/i,
  /\b(telegram|whatsapp)[: ]*[@+]?\w/i,
  /\bwe (can )?(offer|provide) (you )?(link ?building|lead ?generation|app development)\b/i,
];

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
  'getnada.com',
  'maildrop.cc',
  'throwawaymail.com',
  'dispostable.com',
]);

const URL_RE = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const URL_ONE_RE = /(?:https?:\/\/|www\.)\S+/i;
const BARE_DOMAIN_RE =
  /\b[a-z0-9-]{2,}\.(?:com|net|org|ru|cn|xyz|top|club|online|site|shop|info|biz|link|click)\b/gi;
const HTML_TAG_RE = /<\s*\/?\s*(a|script|img|iframe|b|i|u|div|span|p|br|link|style)\b/i;
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

function countUnique(text: string, re: RegExp): number {
  const found = text.match(re) ?? [];
  return new Set(found.map((s) => s.toLowerCase())).size;
}

/** Share of letters that are Cyrillic, CJK, Arabic, Thai or Hebrew (0 to 1). */
function foreignScriptRatio(text: string): { ratio: number; letters: number } {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (!letters.length) return { ratio: 0, letters: 0 };
  const foreign = text.match(
    /[\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Arabic}\p{Script=Thai}\p{Script=Hebrew}]/gu
  );
  return { ratio: (foreign?.length ?? 0) / letters.length, letters: letters.length };
}

function looksRandomName(name: string): boolean {
  // "JqXwPzKt": long single token with 3+ lower-to-upper transitions.
  if (/\s/.test(name) || name.length < 8) return false;
  return (name.match(/[a-z][A-Z]/g) ?? []).length >= 3;
}

export function scoreSubmission(fields: Record<string, string>, meta: SpamMeta = {}): SpamVerdict {
  if (meta.honeypot && meta.honeypot.trim() !== '') {
    return { score: 99, reasons: ['honeypot filled'], action: 'drop' };
  }

  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  // Timing
  const t = meta.elapsedMs;
  if (typeof t !== 'number' || !Number.isFinite(t) || t < 0) {
    add(3, 'no timing data');
  } else if (t < MIN_HUMAN_MS) {
    return { score: 99, reasons: [`submitted in ${Math.round(t)}ms`], action: 'drop' };
  } else if (t < FAST_MS) {
    add(2, 'very fast submit');
  }

  const message = fields.contact_form_message ?? '';
  const email = (fields.email ?? '').trim();
  const phone = fields.mobilephone ?? '';
  const nameFields = [fields.firstname ?? '', fields.lastname ?? ''];
  const shortTextFields = [
    ...nameFields,
    fields.address ?? '',
    fields.city ?? '',
    fields.state ?? '',
    fields.ilo_street ?? '',
    fields.ilo_city ?? '',
    fields.ilo_state ?? '',
    fields.best_time_to_call_ ?? '',
  ];
  const allText = Object.values(fields).join('\n');

  // Links
  const links = countUnique(message, URL_RE) + countUnique(message.replace(URL_RE, ' '), BARE_DOMAIN_RE);
  if (links >= 3) add(4, `${links} links in message`);
  else if (links === 2) add(2, '2 links in message');
  if (shortTextFields.some((v) => URL_ONE_RE.test(v))) add(3, 'link in a short field');

  // Markup
  if (HTML_TAG_RE.test(allText)) add(3, 'html markup');
  if (nameFields.some((n) => /[<>]/.test(n))) add(3, 'angle brackets in name');

  // Solicitation phrases (capped)
  let phraseHits = 0;
  for (const re of SPAM_PHRASES) if (re.test(allText)) phraseHits++;
  if (phraseHits) add(Math.min(6, phraseHits * 3), `${phraseHits} solicitation phrase(s)`);

  // Email shape
  if (email) {
    if (!EMAIL_RE.test(email)) {
      add(3, 'malformed email');
    } else {
      const [local, domain] = email.toLowerCase().split('@');
      if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) add(4, 'disposable email domain');
      if ((local.match(/\./g) ?? []).length >= 4) add(2, 'dot-stuffed email');
    }
  }

  // Phone shape (very soft: free text is allowed)
  if (phone.trim()) {
    const digits = phone.replace(/\D/g, '').length;
    if (digits < 7 || digits > 15) add(1, 'implausible phone');
  }

  // Names
  if (nameFields.some(looksRandomName)) add(2, 'random-looking name');
  const [first, last] = nameFields;
  if (first.length >= 5 && first.toLowerCase() === last.toLowerCase()) add(1, 'first equals last name');

  // Message body
  const { ratio, letters } = foreignScriptRatio(message);
  if (letters >= 20 && ratio > 0.4) add(2, 'non-Latin message');
  if (/(.)\1{14,}/.test(message)) add(2, 'repeated characters');
  const words = message.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 12) {
    const freq = new Map<string, number>();
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
    if (Math.max(...freq.values()) >= Math.max(6, words.length * 0.5)) add(2, 'repeated word');
  }
  if (message.length > 3000) add(2, 'very long message');

  const action: SpamAction = score >= DROP_AT ? 'drop' : score >= FLAG_AT ? 'flag' : 'allow';
  return { score, reasons, action };
}

export function flagPrefix(v: SpamVerdict): string {
  return `[Auto-flag: possible spam, score ${v.score}: ${v.reasons.join(', ')}]\n`;
}
