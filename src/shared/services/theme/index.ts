// Export principal do módulo de temas
export { ThemeFactory } from "./theme-factory";
import { ThemeFactory } from "./theme-factory";

// Re-export types
export type {
  CustomTheme,
  ThemeColors,
  ThemeSpacing,
  ThemeConfig,
  ThemeContextType,
  CreateThemeOptions,
  ThemePreset,
} from "@/shared/types/theme";
import type { CustomTheme, ThemePreset } from "@/shared/types/theme";

// Re-export provider components
export {
  ThemeProvider,
  ExtendedThemeProvider,
  useExtendedTheme,
  useTheme,
  useThemeColors,
  useThemeActions,
} from "@/shared/components/providers/theme-provider";

// Re-export UI components
export {
  ThemeToggle,
  ThemeColorSelector,
  ThemeSelector,
  ThemePreview,
  ThemeGrid,
} from "@/shared/components/ui/theme-selector";

// Helper para criar temas facilmente
export const createCustomThemes = {
  fromPreset: (id: string, name: string, preset: ThemePreset) =>
    ThemeFactory.createTheme(id, name, { preset }),

  fromPrimary: (
    id: string,
    name: string,
    primaryLight: string,
    primaryDark: string,
  ) => ThemeFactory.createThemeFromPrimary(id, name, primaryLight, primaryDark),

  fromColor: (id: string, name: string, baseColor: string) =>
    ThemeFactory.generateThemeFromColor(id, name, baseColor),

  custom: (theme: CustomTheme) => ThemeFactory.createCustomTheme(theme),
};

// Temas predefinidos prontos para uso
export const predefinedThemes = {
  default: ThemeFactory.createTheme("default", "Default"),
  blue: ThemeFactory.createTheme("blue", "Blue", { preset: "blue" }),
  green: ThemeFactory.createTheme("green", "Green", { preset: "green" }),
  orange: ThemeFactory.createTheme("orange", "Orange", { preset: "orange" }),
  red: ThemeFactory.createTheme("red", "Red", { preset: "red" }),
  violet: ThemeFactory.createTheme("violet", "Violet", { preset: "violet" }),
  slate: ThemeFactory.createTheme("slate", "Slate", { preset: "slate" }),
};
