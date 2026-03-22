import { ValidationError } from "@/lib/core/errors";

export type BlipInput = {
  term: string;
  meaning: string;
};

export function assertValidBlipInput(term: string, meaning: string): BlipInput {
  const normalizedTerm = term.trim();
  const normalizedMeaning = meaning.trim();

  if (!normalizedTerm) {
    throw new ValidationError("Term is required");
  }

  if (!normalizedMeaning) {
    throw new ValidationError("Meaning is required");
  }

  return {
    term: normalizedTerm,
    meaning: normalizedMeaning,
  };
}

export function parseBlipCommandInput(input: string): BlipInput {
  const colonIndex = input.indexOf(":");

  if (colonIndex === -1) {
    throw new ValidationError("Usage: /blip <term>:<meaning>");
  }

  return assertValidBlipInput(
    input.slice(0, colonIndex),
    input.slice(colonIndex + 1)
  );
}

