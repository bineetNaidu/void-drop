/**
 * Generates a random alphanumeric short ID.
 * @param length Length of the ID (default: 8, range: 6-8)
 */
export function generateId(length: number = 8): string {
  // Enforce length between 6 and 8
  const validLength = Math.max(6, Math.min(8, length));

  // URL-safe character set (62 characters)
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  const randomValues = new Uint8Array(validLength);
  crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < validLength; i++) {
    // Map random byte to character set index
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}
