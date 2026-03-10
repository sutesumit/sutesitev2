const FINGERPRINT_KEY = 'clap_fingerprint';

/**
 * Generate a UUID v4 string
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create a persistent fingerprint for this browser
 * Used to identify unique users for clap counting
 */
export function getOrCreateFingerprint(): string {
  if (typeof window === 'undefined') return '';

  let fingerprint = localStorage.getItem(FINGERPRINT_KEY);

  if (!fingerprint) {
    fingerprint = generateUUID();
    localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  }

  return fingerprint;
}

/**
 * Clear the stored fingerprint (useful for testing)
 */
export function clearFingerprint(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FINGERPRINT_KEY);
  }
}
