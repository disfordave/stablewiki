import { WIKI_HOMEPAGE_LINK } from "@/config";

export function getAccessEditLevelString(
  editLevel: number,
  title?: string,
): string {
  if (title && editLevel === 0) {
    if (title.startsWith("User:")) {
      return "User's own page (themselves and admins only)";
    } else if (title.startsWith("Wiki:")) {
      return "Editors and above";
    } else if (title.startsWith("System:")) {
      return "Admin Only";
    } else if (title === WIKI_HOMEPAGE_LINK.slice(6)) {
      return "Editors and above";
    }
  }

  switch (editLevel) {
    case 0:
      return "Signed In Users";
    case 1:
      return "Signed In Users (reserved)";
    case 2:
      return "Signed In Users after 14 days";
    case 7:
      return "Moderators and above";
    case 8:
      return "Editors and above";
    case 9:
      return "Admin Only";
    default:
      return "Unknown changes";
  }
}
