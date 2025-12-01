import type {
  ICustomTheme,
  IThemeColors,
  ICreateThemeOptions,
  ThemePreset,
} from "@/shared/types/theme";

// Temas base predefinidos (Template Method Pattern)
const baseThemes: Record<
  ThemePreset,
  { light: IThemeColors; dark: IThemeColors }
> = {
  default: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "222.2 47.4% 11.2%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "222.2 84% 4.9%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "210 40% 98%",
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "212.7 26.8% 83.9%",
    },
  },
  blue: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "221.2 83.2% 53.3%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "221.2 83.2% 53.3%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "217.2 91.2% 59.8%",
      primaryForeground: "222.2 47.4% 11.2%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "217.2 91.2% 59.8%",
    },
  },
  green: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "142.1 76.2% 36.3%",
      primaryForeground: "355.7 100% 97.3%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "142.1 76.2% 36.3%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "142.1 70.6% 45.3%",
      primaryForeground: "144.9 80.4% 10%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "142.1 70.6% 45.3%",
    },
  },
  orange: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "24.6 95% 53.1%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "24.6 95% 53.1%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "20.5 90.2% 48.2%",
      primaryForeground: "60 9.1% 97.8%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "20.5 90.2% 48.2%",
    },
  },
  red: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "0 84.2% 60.2%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "0 84.2% 60.2%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "0 72.2% 50.6%",
      primaryForeground: "210 40% 98%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "0 72.2% 50.6%",
    },
  },
  violet: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "262.1 83.3% 57.8%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "262.1 83.3% 57.8%",
    },
    dark: {
      background: "222.2 84% 4.9%",
      foreground: "210 40% 98%",
      card: "222.2 84% 4.9%",
      cardForeground: "210 40% 98%",
      popover: "222.2 84% 4.9%",
      popoverForeground: "210 40% 98%",
      primary: "263.4 70% 50.4%",
      primaryForeground: "210 40% 98%",
      secondary: "217.2 32.6% 17.5%",
      secondaryForeground: "210 40% 98%",
      muted: "217.2 32.6% 17.5%",
      mutedForeground: "215 20.2% 65.1%",
      accent: "217.2 32.6% 17.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "217.2 32.6% 17.5%",
      input: "217.2 32.6% 17.5%",
      ring: "263.4 70% 50.4%",
    },
  },
  slate: {
    light: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      cardForeground: "222.2 84% 4.9%",
      popover: "0 0% 100%",
      popoverForeground: "222.2 84% 4.9%",
      primary: "215.4 16.3% 46.9%",
      primaryForeground: "210 40% 98%",
      secondary: "210 40% 96%",
      secondaryForeground: "222.2 47.4% 11.2%",
      muted: "210 40% 96%",
      mutedForeground: "215.4 16.3% 46.9%",
      accent: "210 40% 96%",
      accentForeground: "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "215.4 16.3% 46.9%",
    },
    dark: {
      background: "215.3 25% 6.9%",
      foreground: "210 40% 98%",
      card: "215.3 25% 6.9%",
      cardForeground: "210 40% 98%",
      popover: "215.3 25% 6.9%",
      popoverForeground: "210 40% 98%",
      primary: "210 40% 98%",
      primaryForeground: "215.4 16.3% 46.9%",
      secondary: "215.3 19.3% 14.5%",
      secondaryForeground: "210 40% 98%",
      muted: "215.3 19.3% 14.5%",
      mutedForeground: "217.9 10.6% 64.9%",
      accent: "215.3 19.3% 14.5%",
      accentForeground: "210 40% 98%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "210 40% 98%",
      border: "215.3 19.3% 14.5%",
      input: "215.3 19.3% 14.5%",
      ring: "216 12.2% 83.9%",
    },
  },
};

// Factory para criar temas (Factory Pattern)
export class ThemeFactory {
  // Criar tema baseado em preset (Template Method Pattern)
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

    // Merge cores customizadas (Open/Closed Principle)
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

  // Criar tema completamente customizado
  static createCustomTheme(theme: ICustomTheme): ICustomTheme {
    return {
      spacing: { radius: "0.5rem" },
      ...theme,
    };
  }

  // Criar tema baseado em cores primárias
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

  // Gerar tema automaticamente baseado em uma cor
  static generateThemeFromColor(
    id: string,
    name: string,
    baseColor: string,
  ): ICustomTheme {
    // Algoritmo simples para gerar variações da cor base
    // Em uma implementação real, usaríamos uma library como chroma.js
    const hue = this.extractHue(baseColor);

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

  // Utilitário para extrair hue de uma cor HSL
  private static extractHue(hslColor: string): string {
    const match = hslColor.match(/(\d+(?:\.\d+)?)\s+/);
    return match ? match[1] : "221.2";
  }

  // Listar presets disponíveis
  static getAvailablePresets(): ThemePreset[] {
    return Object.keys(baseThemes) as ThemePreset[];
  }

  // Validar tema
  static validateTheme(theme: ICustomTheme): boolean {
    const requiredColorKeys = [
      "background",
      "foreground",
      "primary",
      "primaryForeground",
      "secondary",
      "secondaryForeground",
      "border",
      "ring",
    ];

    const hasAllLightColors = requiredColorKeys.every(
      (key) => key in theme.colors.light,
    );
    const hasAllDarkColors = requiredColorKeys.every(
      (key) => key in theme.colors.dark,
    );

    return hasAllLightColors && hasAllDarkColors;
  }
}
