const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function encodeBase62(num: number): string {
  if (num === 0) return '0';
  
  let result = '';
  let n = num;
  
  while (n > 0) {
    result = BASE62_CHARS[n % 62] + result;
    n = Math.floor(n / 62);
  }
  
  return result;
}

export function decodeBase62(str: string): number {
  let result = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE62_CHARS.indexOf(char);
    if (value === -1) {
      throw new Error(`Invalid base62 character: ${char}`);
    }
    result = result * 62 + value;
  }
  
  return result;
}
