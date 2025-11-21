// Tipos para sistema de temas extensível
export interface IThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  // Cores customizadas podem ser adicionadas
  [key: string]: string;
}

export interface IThemeSpacing {
  radius: string;
  // Spacing customizado pode ser adicionado
  [key: string]: string;
}

export interface ICustomTheme {
  id: string;
  name: string;
  colors: {
    light: IThemeColors;
    dark: IThemeColors;
  };
  spacing?: IThemeSpacing;
  css?: string; // CSS customizado adicional
  fonts?: {
    sans?: string[];
    serif?: string[];
    mono?: string[];
  };
}

export interface IThemeConfig {
  defaultTheme: string;
  enableSystem: boolean;
  themes: ICustomTheme[];
  storageKey?: string;
  attribute?: string;
}

export interface IThemeContextType {
  currentTheme: string;
  availableThemes: ICustomTheme[];
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  systemTheme: "light" | "dark" | undefined;
  resolvedTheme: string;
  // Registro de novos temas (Open/Closed Principle)
  registerTheme: (theme: ICustomTheme) => void;
  unregisterTheme: (themeId: string) => void;
  // Customização em tempo real
  updateThemeColors: (
    themeId: string,
    mode: "light" | "dark",
    colors: Partial<IThemeColors>,
  ) => void;
}

// Factory para criar temas predefinidos
export type ThemePreset =
  | "default"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "violet"
  | "slate";

export interface ICreateThemeOptions {
  preset?: ThemePreset;
  customColors?: {
    light?: Partial<IThemeColors>;
    dark?: Partial<IThemeColors>;
  };
  customSpacing?: Partial<IThemeSpacing>;
  customFonts?: {
    sans?: string[];
    serif?: string[];
    mono?: string[];
  };
}
