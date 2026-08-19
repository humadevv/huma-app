/**
 * HUMA Multi-Language Content Safety & Child-Friendly Protection Engine
 * 
 * Protects children, families, and global users by detecting offensive language,
 * profanity, slurs, harassment, hate speech, vulgarity, and explicit terms across
 * multiple languages (English, Spanish, French, German, Italian, Portuguese, Russian,
 * Arabic, Hindi, Turkish, Albanian, Tagalog, Polish, Dutch, etc.) as well as
 * obfuscated leetspeak patterns (e.g. f*ck, b1tch, sh!t, a$$, etc.).
 */

// Normalized root bad words and offensive patterns across global languages
const OFFENSIVE_TERMS: string[] = [
  // --- ENGLISH ---
  'fuck', 'fucking', 'fucker', 'fck', 'fuk', 'fudgepacker', 'motherfucker', 'mf',
  'shit', 'shitty', 'bullshit', 'sh1t', 'sht',
  'bitch', 'bitches', 'bitching', 'b1tch', 'btch',
  'asshole', 'ass', 'arse', 'arsehole', 'dumbass', 'jackass', 'a$$',
  'bastard', 'cunt', 'dick', 'cock', 'pussy', 'slut', 'whore', 'hoe',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded', 'crap',
  'kill yourself', 'kys', 'die', 'murder', 'rape', 'rapist', 'pedo', 'pedophile',
  'nazi', 'hitler', 'terrorist', 'porn', 'pornography', 'xxx', 'hentai',
  'blowjob', 'handjob', 'cum', 'semen', 'dildo', 'masturbate', 'boobs', 'penis', 'vagina',
  'anal', 'wanker', 'twat', 'prick', 'scumbag', 'douche', 'douchebag',

  // --- SPANISH ---
  'puta', 'puto', 'putas', 'mierda', 'chinga', 'chingar', 'chingado', 'chingada',
  'cabron', 'cabrona', 'pendejo', 'pendeja', 'culero', 'maricon', 'verga', 'coño',
  'joder', 'mamada', 'hijo de puta', 'hdp', 'zorra', 'pelotudo', 'boludo', 'gilipollas',
  'pinche', 'malparido', 'gonorrea', 'chucha', 'carajo', 'singar',

  // --- FRENCH ---
  'merde', 'putain', 'salope', 'connard', 'connasse', 'encule', 'enculer',
  'fils de pute', 'fdp', 'batard', 'pute', 'bite', 'chatte', 'couille', 'bordel',
  'chier', 'nique', 'niquer', 'ta mere', 'trouduc', 'branleur',

  // --- GERMAN ---
  'scheisse', 'scheiße', 'arschloch', 'hurensohn', 'ficken', 'fotze', 'schlampe',
  'wichser', 'hure', 'bastard', 'miststueck', 'spast', 'spasti', 'arsch',

  // --- ITALIAN ---
  'cazzo', 'merda', 'puttana', 'stronzo', 'stronza', 'vaffanculo', 'fanculo',
  'troia', 'porco dio', 'porca madonna', 'dio cane', 'bastardo', 'figa', 'finocchio',

  // --- PORTUGUESE ---
  'porra', 'caralho', 'foda-se', 'fodase', 'arrombado', 'filho da puta', 'puta',
  'merda', 'buceta', 'pau', 'viado', 'bosta', 'cacete', 'foder', 'cuzão',

  // --- RUSSIAN (Cyrillic & Translit) ---
  'сука', 'блядь', 'блять', 'хуй', 'пизда', 'ебать', 'ебал', 'нахуй', 'похуй',
  'мудак', 'гандон', 'гондон', 'пидор', 'пидорас', 'чмо', 'дерьмо', 'залупа',
  'suka', 'blyad', 'blyat', 'khuy', 'huy', 'pizda', 'ebat', 'nahui', 'mudak',

  // --- ARABIC (Script & Franco/Arabizi) ---
  'شرموطة', 'منيك', 'قحبة', 'كسمك', 'كس', 'طيز', 'زب', 'عرص', 'كلب', 'حمار',
  'sharmouta', 'sharmuta', 'kosomak', 'kos', 'teezy', 'zobb', 'ars', 'manyook',

  // --- HINDI / SOUTH ASIAN ---
  'bhenchod', 'madarchod', 'chutiya', 'gaand', 'gandu', 'lund', 'bhosdike', 'bsdk',
  'randi', 'harami', 'kutta', 'kamina', 'saala', 'choot',

  // --- TURKISH ---
  'orospu', 'siktir', 'sikik', 'pic', 'piç', 'amk', 'amına', 'got', 'göt',
  'yarrak', 'yarak', 'tasak', 'taşak', 'kahpe', 'ibne',

  // --- ALBANIAN ---
  'kar', 'pidh', 'mut', 'kurve', 'kurv', 'robt', 'qifsha', 'shkerdhat', 'motren',

  // --- TAGALOG ---
  'putangina', 'tangina', 'gago', 'tarantado', 'ulol', 'bobo', 'kantot', 'tite', 'puki',

  // --- POLISH ---
  'kurwa', 'chuj', 'jebac', 'pierdol', 'pizda', 'skurwysyn', 'szmata'
];

/**
 * Normalize leetspeak and symbols to standard alphabet
 */
function normalizeText(input: string): string {
  let text = input.toLowerCase();

  // Character substitutions
  const charMap: Record<string, string> = {
    '@': 'a',
    '4': 'a',
    '8': 'b',
    '3': 'e',
    '€': 'e',
    '1': 'i',
    '!': 'i',
    '|': 'i',
    '0': 'o',
    '$': 's',
    '5': 's',
    '7': 't',
    '+': 't',
    'v': 'u',
    'vv': 'w',
  };

  // Replace symbols
  text = text.replace(/[@483€1!|0$57+]/g, (char) => charMap[char] || char);

  // Remove accents / diacritics
  text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return text;
}

/**
 * Check if a text contains offensive, vulgar, or inappropriate language
 */
export function checkContentSafety(rawText: string): {
  isSafe: boolean;
  blockedReason?: string;
  matchedWord?: string;
} {
  if (!rawText || typeof rawText !== 'string') {
    return { isSafe: true };
  }

  const normalized = normalizeText(rawText);
  // Compact version with all non-alphanumeric removed (catches "f.u.c.k", "f-u-c-k", "f u c k")
  const strippedText = normalized.replace(/[^a-z0-9а-яё\u0600-\u06FF]/gi, '');
  
  // Word tokens
  const words = normalized.split(/[\s,.;:!?_/\-–—"'{}\[\]()+*#%&^<>~`|\\]+/).filter(Boolean);

  for (const term of OFFENSIVE_TERMS) {
    const termClean = term.toLowerCase();

    // 1. Direct word match
    for (const w of words) {
      if (w === termClean) {
        return {
          isSafe: false,
          blockedReason: 'Inappropriate or offensive language detected.',
          matchedWord: termClean,
        };
      }
    }

    // 2. Substring match for compound phrases / multi-word slurs
    if (termClean.includes(' ') && normalized.includes(termClean)) {
      return {
        isSafe: false,
        blockedReason: 'Inappropriate or offensive phrase detected.',
        matchedWord: termClean,
      };
    }

    // 3. Compact stripped text check for spaced/masked words of length >= 4
    if (termClean.length >= 4 && strippedText.includes(termClean)) {
      return {
        isSafe: false,
        blockedReason: 'Inappropriate or offensive content detected.',
        matchedWord: termClean,
      };
    }
  }

  return { isSafe: true };
}

/**
 * Standard kid-safe and family-friendly notification message
 */
export const CONTENT_SAFETY_POLICY_MESSAGE =
  '⚠️ Inappropriate language detected. HUMA is a safe, family-friendly space for everyone. Please keep your comments kind, respectful, and appropriate for all ages.';
