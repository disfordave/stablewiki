export function checkRedirect(
  content: string,
  slug: string,
): {
  isRedirect: boolean;
  isLoop: boolean;
  targetSlug: string | null;
} {
  const match = content.match(/^#REDIRECT\s+\[\[([^\]]+)\]\]/im);
  if (match) {
    const targetSlug = match[1].trim();
    if (targetSlug === slug) {
      return { isLoop: true, targetSlug: null, isRedirect: false };
    }
    return { isLoop: false, targetSlug, isRedirect: true };
  }
  return { isLoop: false, targetSlug: null, isRedirect: false };
}