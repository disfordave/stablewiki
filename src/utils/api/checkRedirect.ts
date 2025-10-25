
function normalizeSlug(raw: string) {
  const decoded = decodeURIComponent(raw);
  const trimmed = decoded.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;

  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

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

    // Normalize both sides before comparing
    const normalizedTarget = normalizeSlug(targetSlug);
    const normalizedCurrent = normalizeSlug(decodeURIComponent(slug));

    if (normalizedTarget.toLowerCase() === normalizedCurrent.toLowerCase()) {
      // same logical page (case or encoding differs)
      return { isLoop: true, targetSlug: null, isRedirect: false };
    }

    return { isLoop: false, targetSlug, isRedirect: true };
  }

  return { isLoop: false, targetSlug: null, isRedirect: false };
}