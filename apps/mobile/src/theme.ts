export type ThemeMode = "dark" | "light"

/**
 * Semantic colour tokens. Every screen reads these rather than literals so a
 * single palette swap flips the whole app.
 *
 * Naming rules worth keeping to:
 * - `primary` is an *accent for text and icons*, so it has to contrast with
 *   `bg`. That's why it darkens in light mode instead of staying mint.
 * - `primaryFill` / `onPrimary` are the filled-button pair and stay constant in
 *   both modes: mint fill with near-black text reads well on either background
 *   and keeps the brand colour intact.
 * - The `primary*` tints are washes over `bg`, derived from that mode's accent.
 */
export type Palette = {
  /** Screen background. */
  bg: string
  /** Inset surface: text inputs, metric strips. */
  bgSoft: string
  /** Card background. */
  surface: string
  /** Card background, one step up from `surface`. */
  surfaceLight: string
  /** Chips and pills that sit on top of a card. */
  surfaceRaised: string
  /** Standard 1px border. */
  border: string
  /** Hairline divider, weaker than `border`. */
  borderSoft: string
  /** Primary text. */
  text: string
  /** Secondary text. Contrast-checked against `bg`. */
  muted: string
  /** Accent for text and icons. Contrast-checked against `bg`. */
  primary: string
  /** Darker accent, for pressed states and gradient ends. */
  primaryDark: string
  /** Filled-button gradient. */
  primaryFill: readonly [string, string]
  /** Filled-button flat background. Pairs with `onPrimary`, never with `text`. */
  primarySolid: string
  /** Text and icons sitting on `primaryFill` / `primarySolid`. */
  onPrimary: string
  /** Accent wash: badge and chip backgrounds. */
  primarySoft: string
  /** Accent wash, weaker: banners. */
  primarySofter: string
  /** Accent border. */
  primaryBorder: string
  /** Accent border, weaker. */
  primaryBorderSoft: string
  /** Decorative glow behind the hero logo. */
  glow: string
  /** Modal scrim. */
  overlay: string
  /** Full-screen background gradient. */
  gradient: readonly [string, string, string]
  /** Shadow colour for elevated cards. */
  shadow: string
  danger: string
  /** Danger wash: destructive-button background. */
  dangerSoft: string
  warning: string
  success: string
  /** Success wash: "resolved" badge background. */
  successSoft: string
  info: string
  /** Info wash: "active" badge background. */
  infoSoft: string
  /** Suggestions accent. */
  amber: string
  /** Feedback accent. */
  violet: string
}

const dark: Palette = {
  bg: "#061018",
  bgSoft: "#0c1a24",
  surface: "#122533",
  surfaceLight: "#183041",
  surfaceRaised: "rgba(255,255,255,0.03)",
  border: "#28485a",
  borderSoft: "#1b3341",
  text: "#f4fbf9",
  muted: "#9bb4bc",
  primary: "#45d6a1",
  primaryDark: "#2fb888",
  primaryFill: ["#45d6a1", "#2fb888"],
  primarySolid: "#45d6a1",
  onPrimary: "#042018",
  primarySoft: "rgba(69,214,161,0.12)",
  primarySofter: "rgba(69,214,161,0.05)",
  primaryBorder: "rgba(69,214,161,0.3)",
  primaryBorderSoft: "rgba(69,214,161,0.2)",
  glow: "rgba(69,214,161,0.05)",
  overlay: "rgba(0,0,0,0.6)",
  gradient: ["#061018", "#0a1c28", "#061018"],
  shadow: "#000000",
  danger: "#ff6b6b",
  dangerSoft: "rgba(255,107,107,0.12)",
  warning: "#fbbf24",
  success: "#34d399",
  successSoft: "rgba(52,211,153,0.15)",
  info: "#60a5fa",
  infoSoft: "rgba(96,165,250,0.15)",
  amber: "#f59e0b",
  violet: "#8b5cf6",
}

const light: Palette = {
  bg: "#f7faf9",
  bgSoft: "#eef4f2",
  surface: "#ffffff",
  surfaceLight: "#f8fbfa",
  surfaceRaised: "rgba(11,31,26,0.04)",
  border: "#d8e4e0",
  borderSoft: "#eceff0",
  text: "#0b1f1a",
  // Deliberately darker than the dark-mode value: #9bb4bc only reaches ~2:1 on
  // white, which is why secondary text was hard to read on the light screens.
  muted: "#5a6f6a",
  primary: "#0a7d5b",
  primaryDark: "#065f45",
  primaryFill: ["#45d6a1", "#2fb888"],
  primarySolid: "#45d6a1",
  onPrimary: "#042018",
  primarySoft: "rgba(10,125,91,0.12)",
  primarySofter: "rgba(10,125,91,0.05)",
  primaryBorder: "rgba(10,125,91,0.28)",
  primaryBorderSoft: "rgba(10,125,91,0.18)",
  glow: "rgba(10,125,91,0.06)",
  overlay: "rgba(11,31,26,0.4)",
  gradient: ["#ffffff", "#eef7f3", "#ffffff"],
  shadow: "#0b1f1a",
  danger: "#c62828",
  dangerSoft: "#fff1f2",
  warning: "#a16207",
  success: "#0f8f5f",
  successSoft: "rgba(15,143,95,0.14)",
  info: "#1d6fd0",
  infoSoft: "rgba(29,111,208,0.12)",
  amber: "#b45309",
  violet: "#6d28d9",
}

export const palettes: Record<ThemeMode, Palette> = { dark, light }

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
}

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
}
