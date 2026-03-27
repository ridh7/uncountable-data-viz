// camelCase keys are injected as kebab-case CSS variables in main.tsx
// e.g. textSecondary → --color-text-secondary
export const theme = {
  colors: {
    primary: "#2328AF",
    primaryLight: "#4A50C7",
    primaryDark: "#1A1F82",
    accent: "#F59E0B",
    background: "#F8F9FC",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    text: "#1A1A2E",
    textSecondary: "#6B7280",
    onPrimary: "#FFFFFF",
    muted: "#D1D5DB",
  },
  chartPalette: ["#4F46E5", "#EA580C", "#0891B2", "#059669"] as const,
} as const;
