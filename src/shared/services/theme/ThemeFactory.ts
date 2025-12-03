// Theme Factory - Factory Pattern for creating themes
import type {
  ICustomTheme,
  IThemeColors,
  ICreateThemeOptions,
  ThemePreset,
} from "@/shared/types/theme";

import { baseThemes } from "./theme-presets";
import { ThemeValidator } from "./theme-validator";

export class ThemeFactory {
  // Create theme based on preset (Template Method Pattern)
  static createTheme(
    id: string,
    name: string,
    options: ICreateThemeOptions = {},
  ): ICustomTheme {
    const {
      preset = "default",
      customColors,
      customSpacing,
      customFonts,
    } = options;

    const baseTheme = baseThemes[preset];
    if (!baseTheme) {
      throw new Error(`Theme preset '${preset}' not found`);
    }

    // Merge custom colors (Open/Closed Principle)
    const lightColors = {
      ...baseTheme.light,
      ...(customColors?.light || {}),
    } as IThemeColors;
    const darkColors = {
      ...baseTheme.dark,
      ...(customColors?.dark || {}),
    } as IThemeColors;

    return {
      id,
      name,
      colors: {
        light: lightColors,
        dark: darkColors,
      },
      spacing: {
        radius: "0.5rem",
        ...customSpacing,
      },
      fonts: customFonts,
    };
  }

  // Create completely custom theme
  static createCustomTheme(theme: ICustomTheme): ICustomTheme {
    return {
      spacing: { radius: "0.5rem" },
      ...theme,
    };
  }

  // Create theme based on primary colors
  static createThemeFromPrimary(
    id: string,
    name: string,
    primaryLight: string,
    primaryDark: string,
  ): ICustomTheme {
    return this.createTheme(id, name, {
      preset: "default",
      customColors: {
        light: { primary: primaryLight, ring: primaryLight },
        dark: { primary: primaryDark, ring: primaryDark },
      },
    });
  }

  // Generate theme automatically from a color
  static generateThemeFromColor(
    id: string,
    name: string,
    baseColor: string,
  ): ICustomTheme {
    const hue = ThemeValidator.extractHue(baseColor);

    return this.createTheme(id, name, {
      customColors: {
        light: {
          primary: `${hue} 83.2% 53.3%`,
          ring: `${hue} 83.2% 53.3%`,
        },
        dark: {
          primary: `${hue} 91.2% 59.8%`,
          ring: `${hue} 91.2% 59.8%`,
        },
      },
    });
  }

  // List available presets
  static getAvailablePresets(): ThemePreset[] {
    return Object.keys(baseThemes) as ThemePreset[];
  }

  // Validate theme
  static validateTheme(theme: ICustomTheme): boolean {
    return ThemeValidator.validateTheme(theme);
  }
}
