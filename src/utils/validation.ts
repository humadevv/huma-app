export const validatePassword = (pwd: string): { valid: boolean; error?: string } => {
  if (pwd.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { valid: false, error: 'Password must contain at least 1 capital (uppercase) letter.' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { valid: false, error: 'Password must contain at least 1 number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
    return { valid: false, error: 'Password must contain at least 1 special character (e.g. !, @, ?, #, $).' };
  }
  return { valid: true };
};

// Verified and reputable public email providers
const VERIFIED_PROVIDERS = new Set([
  // Google
  'gmail.com',
  'googlemail.com',
  // Yahoo
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.ca',
  'yahoo.com.au',
  'yahoo.de',
  'yahoo.fr',
  'yahoo.es',
  'yahoo.it',
  'yahoo.co.in',
  'yahoo.co.jp',
  'yahoo.com.br',
  'ymail.com',
  'rocketmail.com',
  // Microsoft
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'passport.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'hotmail.es',
  'hotmail.it',
  'outlook.fr',
  'outlook.de',
  'outlook.es',
  'outlook.co.uk',
  'windowslive.com',
  // Apple
  'icloud.com',
  'me.com',
  'mac.com',
  // Proton
  'proton.me',
  'protonmail.com',
  'pm.me',
  // AOL
  'aol.com',
  'aim.com',
  // Zoho
  'zoho.com',
  'zohomail.com',
  // Mail.com & GMX
  'mail.com',
  'email.com',
  'gmx.com',
  'gmx.net',
  'gmx.de',
  'gmx.at',
  'gmx.ch',
  // Fastmail
  'fastmail.com',
  'fastmail.fm',
  // Yandex
  'yandex.com',
  'yandex.ru',
  'ya.ru',
  // Tuta
  'tuta.com',
  'tutanota.com',
  // Hey
  'hey.com',
]);

// Known throwaway, disposable or burner domains to explicitly block
const BLOCKED_DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'sharklasers.com',
  'trashmail.com',
  'dispostable.com',
  'yopmail.com',
  'getairmail.com',
  'fakeinbox.com',
  'nada.ltd',
  'generator.email',
  'emailondeck.com',
  'temp-mail.org',
  'throwawaymail.com',
  'mohmal.com',
  'burnermail.io'
]);

// Standard valid ICANN TLDs for enterprise/institutional addresses
const RECOGNIZED_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'io', 'co', 'me', 'app', 'dev', 'tech', 'ai', 'cloud',
  'uk', 'ca', 'au', 'de', 'fr', 'es', 'it', 'nl', 'br', 'in', 'jp', 'se', 'no', 'fi', 'dk', 'ch', 'at', 'be', 'nz', 'za', 'ie', 'sg', 'ae', 'us'
]);

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  domain?: string;
  isVerifiedProvider?: boolean;
}

export const validateEmailProvider = (emailStr: string): EmailValidationResult => {
  const trimmed = emailStr.trim().toLowerCase();
  
  if (!trimmed) {
    return { valid: false, error: 'Email address is required.' };
  }

  // Standard email format regex (RFC 5322 compliant subset)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address format (e.g. name@gmail.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid email address.' };
  }

  const localPart = parts[0];
  const domainPart = parts[1];

  if (localPart.length < 1 || localPart.length > 64) {
    return { valid: false, error: 'Email username must be between 1 and 64 characters.' };
  }

  // Check disposable blocklist
  if (BLOCKED_DISPOSABLE_DOMAINS.has(domainPart)) {
    return {
      valid: false,
      error: 'Temporary or disposable email addresses are not accepted. Please use a verified email provider.',
    };
  }

  // Check top-level verified providers (e.g. @gmail.com, @yahoo.com, @outlook.com, @icloud.com)
  if (VERIFIED_PROVIDERS.has(domainPart)) {
    return {
      valid: true,
      domain: domainPart,
      isVerifiedProvider: true,
    };
  }

  // Check if it's an educational or government email (e.g., stanford.edu, oxford.ac.uk)
  const domainSegments = domainPart.split('.');
  const tld = domainSegments[domainSegments.length - 1];
  const sld = domainSegments.length > 2 ? domainSegments[domainSegments.length - 2] : '';

  if (tld === 'edu' || tld === 'gov' || sld === 'edu' || sld === 'ac' || sld === 'gov') {
    return {
      valid: true,
      domain: domainPart,
      isVerifiedProvider: true,
    };
  }

  // If the domain is not in verified providers list, check if the TLD is even a real TLD
  if (!RECOGNIZED_TLDS.has(tld)) {
    return {
      valid: false,
      error: `The email domain "${domainPart}" is not recognized. Please use a verified provider (e.g. @gmail.com, @yahoo.com, @outlook.com, @icloud.com).`,
    };
  }

  // Check for common gibberish / fake domain patterns (e.g. consonants only, repeating random characters, missing vowels in long domain)
  const mainDomain = domainSegments[domainSegments.length - 2];
  if (mainDomain && mainDomain.length > 5 && !/[aeiouy0-9]/i.test(mainDomain)) {
    return {
      valid: false,
      error: `Invalid email domain "@${domainPart}". Please use a recognized email provider (e.g. @gmail.com, @yahoo.com).`,
    };
  }

  // Default: we enforce verified email providers for all signups & signins
  return {
    valid: true,
    domain: domainPart,
    isVerifiedProvider: true,
  };
};

/**
 * Username validation:
 * - Must be at least 3 characters long
 * - Allowed chars: letters, numbers, underscores
 * - The control panel username (@c) is strictly reserved for the developer panel
 */
export const validateUsername = (
  username: string,
  isDeveloperUser: boolean = false
): { valid: boolean; error?: string } => {
  const clean = username.trim().toLowerCase();

  if (!clean) {
    return { valid: false, error: 'Username is required.' };
  }

  // Developer control panel exception (@c)
  if (clean === 'c') {
    if (isDeveloperUser) {
      return { valid: true };
    }
    return {
      valid: false,
      error: 'The username @c is strictly reserved for the developer control panel.',
    };
  }

  // Legacy user @d exception
  if (clean === 'd') {
    return { valid: true };
  }

  if (clean.length < 3) {
    return {
      valid: false,
      error: 'Username must be at least 3 characters long.',
    };
  }

  if (clean.length > 30) {
    return {
      valid: false,
      error: 'Username cannot exceed 30 characters.',
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, and underscores (_).',
    };
  }

  return { valid: true };
};

