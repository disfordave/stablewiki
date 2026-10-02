export const THEME_COLORS = [
  "violet",
  "rose",
  "orange",
  "sky",
  "emerald",
  "yellow",
  "pink",
  "indigo",
  "zinc",
] as const;

export type ThemeColor = (typeof THEME_COLORS)[number];

// Unknown colors fall back to the default instead of breaking the theme
export function resolveThemeColor(color: string | undefined): ThemeColor {
  return THEME_COLORS.find((theme) => theme === color) ?? "violet";
}

// The wiki's color is chosen at runtime by the data-theme-color attribute on
// <html> (see globals.css), so these class names are the same for every wiki.
export const getThemeColor = {
  bg: {
    base: "bg-theme-500",
    hover: "hover:bg-theme-600",
    hoverSameAsBase: "hover:bg-theme-500",
    groupHover: "group-hover:bg-theme-600",
  },
  text: {
    base: "text-theme-500",
    hover: "hover:text-theme-600",
  },
  fill: {
    primary: "fill-theme-600",
    secondary: "fill-theme-400",
  },
  border: {
    base: "border-theme-500",
  },
  etc: {
    focusRing: "focus:ring-theme-500",
    accent: "accent-theme-500",
    selection: "selection:bg-theme-500/35",
  },
};
