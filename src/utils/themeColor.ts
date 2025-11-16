import { WIKI_THEME_COLOR } from "@/config";

const themeColors = {
  violet: {
    bg: {
      base: "bg-violet-500",
      hover: "hover:bg-violet-600",
      groupHover: "group-hover:bg-violet-600",
    },
    text: {
      base: "text-violet-500",
      hover: "hover:text-violet-600",
    },
    fill: {
      primary: "fill-violet-600",
      secondary: "fill-violet-400",
    },
    border: {
      base: "border-violet-500",
    },
    etc: {
      focusRing: "focus:ring-violet-500",
      accent: "accent-violet-500",
      selection: "selection:bg-violet-500/35",
    },
  },
  rose: {
    bg: {
      base: "bg-rose-500",
      hover: "hover:bg-rose-600",
      groupHover: "group-hover:bg-rose-600",
    },
    text: {
      base: "text-rose-500",
      hover: "hover:text-rose-600",
    },
    fill: {
      primary: "fill-rose-600",
      secondary: "fill-rose-400",
    },
    border: {
      base: "border-rose-500",
    },
    etc: {
      focusRing: "focus:ring-rose-500",
      accent: "accent-rose-500",
      selection: "selection:bg-rose-500/35",
    },
  },
  //   red: {
  //     bg: {
  //         base: "bg-red-500",
  //         hover: "hover:bg-red-600",
  //     },
  //     text: {
  //         base: "text-red-500",
  //         hover: "hover:text-red-600",
  //     },
  //     fill: {
  //         primary: "fill-red-600",
  //         secondary: "fill-red-400",
  //     },
  //     etc: {
  //         focusRing: "focus:ring-red-500",
  //         accent: "accent-red-500",
  //     }
  //   },
  orange: {
    bg: {
      base: "bg-orange-500",
      hover: "hover:bg-orange-600",
      groupHover: "group-hover:bg-orange-600",
    },
    text: {
      base: "text-orange-500",
      hover: "hover:text-orange-600",
    },
    fill: {
      primary: "fill-orange-600",
      secondary: "fill-orange-400",
    },
    border: {
      base: "border-orange-500",
    },
    etc: {
      focusRing: "focus:ring-orange-500",
      accent: "accent-orange-500",
      selection: "selection:bg-orange-500/35",
    },
  },
  sky: {
    bg: {
      base: "bg-sky-500",
      hover: "hover:bg-sky-600",
      groupHover: "group-hover:bg-sky-600",
    },
    text: {
      base: "text-sky-500",
      hover: "hover:text-sky-600",
    },
    fill: {
      primary: "fill-sky-600",
      secondary: "fill-sky-400",
    },
    border: {
      base: "border-sky-500",
    },
    etc: {
      focusRing: "focus:ring-sky-500",
      accent: "accent-sky-500",
      selection: "selection:bg-sky-500/35",
    },
  },
  emerald: {
    bg: {
      base: "bg-emerald-500",
      hover: "hover:bg-emerald-600",
      groupHover: "group-hover:bg-emerald-600",
    },
    text: {
      base: "text-emerald-500",
      hover: "hover:text-emerald-600",
    },
    fill: {
      primary: "fill-emerald-600",
      secondary: "fill-emerald-400",
    },
    border: {
      base: "border-emerald-500",
    },
    etc: {
      focusRing: "focus:ring-emerald-500",
      accent: "accent-emerald-500",
      selection: "selection:bg-emerald-500/35",
    },
  },
  //   blue: {
  //     bg: {
  //         base: "bg-blue-500",
  //         hover: "hover:bg-blue-600",
  //     },
  //     text: {
  //         base: "text-blue-500",
  //         hover: "hover:text-blue-600",
  //     },
  //     fill: {
  //         primary: "fill-blue-600",
  //         secondary: "fill-blue-400",
  //     },
  //     etc: {
  //         focusRing: "focus:ring-blue-500",
  //         accent: "accent-blue-500",
  //     }
  //   },
  //   green: {
  //     bg: {
  //         base: "bg-green-500",
  //         hover: "hover:bg-green-600",
  //     },
  //     text: {
  //         base: "text-green-500",
  //         hover: "hover:text-green-600",
  //     },
  //     fill: {
  //         primary: "fill-green-600",
  //         secondary: "fill-green-400",
  //     },
  //     etc: {
  //         focusRing: "focus:ring-green-500",
  //         accent: "accent-green-500",
  //     }
  //   },
  yellow: {
    bg: {
      base: "bg-yellow-500",
      hover: "hover:bg-yellow-600",
      groupHover: "group-hover:bg-yellow-600",
    },
    text: {
      base: "text-yellow-500",
      hover: "hover:text-yellow-600",
    },
    fill: {
      primary: "fill-yellow-600",
      secondary: "fill-yellow-400",
    },
    border: {
      base: "border-yellow-500",
    },
    etc: {
      focusRing: "focus:ring-yellow-500",
      accent: "accent-yellow-500",
      selection: "selection:bg-yellow-500/35",
    },
  },
  pink: {
    bg: {
      base: "bg-pink-500",
      hover: "hover:bg-pink-600",
      groupHover: "group-hover:bg-pink-600",
    },
    text: {
      base: "text-pink-500",
      hover: "hover:text-pink-600",
    },
    fill: {
      primary: "fill-pink-600",
      secondary: "fill-pink-400",
    },
    border: {
      base: "border-pink-500",
    },
    etc: {
      focusRing: "focus:ring-pink-500",
      accent: "accent-pink-500",
      selection: "selection:bg-pink-500/35",
    },
  },
  indigo: {
    bg: {
      base: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
      groupHover: "group-hover:bg-indigo-600",
    },
    text: {
      base: "text-indigo-500",
      hover: "hover:text-indigo-600",
    },
    fill: {
      primary: "fill-indigo-600",
      secondary: "fill-indigo-400",
    },
    border: {
      base: "border-indigo-500",
    },
    etc: {
      focusRing: "focus:ring-indigo-500",
      accent: "accent-indigo-500",
      selection: "selection:bg-indigo-500/35",
    },
  },
  zinc: {
    bg: {
      base: "bg-zinc-500",
      hover: "hover:bg-zinc-600",
      groupHover: "group-hover:bg-zinc-600",
    },
    text: {
      base: "text-zinc-500",
      hover: "hover:text-zinc-600",
    },
    fill: {
      primary: "fill-zinc-600",
      secondary: "fill-zinc-400",
    },
    border: {
      base: "border-zinc-500",
    },
    etc: {
      focusRing: "focus:ring-zinc-500",
      accent: "accent-zinc-500",
      selection: "selection:bg-zinc-500/35",
    },
  },
};

export function getThemeColorFunc(): {
  bg: { base: string; hover: string; groupHover: string };
  text: { base: string; hover: string };
  fill: { primary: string; secondary: string };
  border: { base: string };
  etc: { focusRing: string; accent: string; selection: string };
} {
  return (
    themeColors[WIKI_THEME_COLOR as keyof typeof themeColors] ||
    themeColors.violet
  );
}

export const getThemeColor = getThemeColorFunc();