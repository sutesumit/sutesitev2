export function calculateReadingTime(content: string): number {
  const cleanedContent = stripMdxSyntax(content);
  const wordCount = countWords(cleanedContent);
  const wordsPerMinute = 200;
  const minutes = wordCount / wordsPerMinute;
  return Math.max(1, Math.ceil(minutes));
}

function stripMdxSyntax(content: string): string {
  let result = content;

  result = result.replace(/^---[\s\S]*?^---/gm, '');

  result = result.replace(/^import\s+.*?from\s+['"][^'"]*['"];?\s*$/gm, '');

  result = result.replace(/<[A-Z][a-zA-Z0-9_]*[^>]*\/>/g, '');
  result = result.replace(/<[A-Z][a-zA-Z0-9_]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z0-9_]*>/g, '');

  result = result.replace(/^```[\w]*\n?/gm, '');
  result = result.replace(/^~~~[\w]*\n?/gm, '');

  result = result.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

  result = result.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  return result;
}

function countWords(content: string): number {
  const trimmed = content.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(word => word.length > 0).length;
}
