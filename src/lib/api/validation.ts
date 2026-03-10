import { MAX_CONTENT_LENGTH } from './constants';

/**
 * Validate the API key from request headers
 * Supports both "K" (short) and "X-Key" (legacy) headers
 */
export function validateApiKey(authHeader: string | null): boolean {
  const key = process.env.BLIP_SECRET_KEY;
  if (!key) {
    console.error("BLIP_SECRET_KEY not configured");
    return false;
  }
  if (!authHeader) return false;
  return authHeader === key;
}

/**
 * Parse content from request body
 * Handles JSON, form-urlencoded, and plain text
 */
export async function parseContent(req: Request): Promise<string> {
  const contentType = req.headers.get("content-type") || "";
  
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const content = params.get("content") || params.get("") || text.replace(/^content=/, "");
    return content.trim();
  }
  
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      return typeof body?.content === 'string' ? body.content.trim() : "";
    } catch {
      return "";
    }
  }
  
  try {
    const text = await req.text();
    return text.trim();
  } catch {
    return "";
  }
}

/**
 * Validate content length
 */
export function validateContentLength(content: string): { valid: boolean; error?: string } {
  if (!content) {
    return { valid: false, error: "Content is required" };
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return { valid: false, error: `Content must be ${MAX_CONTENT_LENGTH} characters or less` };
  }
  return { valid: true };
}
