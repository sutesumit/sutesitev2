import { validateContentLength } from "@/lib/api/validation";
import { ValidationError } from "@/lib/core/errors";

export function assertValidByteContent(content: string): string {
  const normalized = content.trim();
  const validation = validateContentLength(normalized);

  if (!validation.valid) {
    throw new ValidationError(validation.error || "Content is required");
  }

  return normalized;
}

