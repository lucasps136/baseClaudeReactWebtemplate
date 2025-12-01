"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import { ThemeFactory } from "@/shared/services/theme/theme-factory";
import type {
  ICustomTheme,
  IThemeContextType,
  IThemeConfig,
  IThemeColors,
} from "@/shared/types/theme";

// Context extensível (Open/Closed Principle)
const ExtendedThemeContext = createContext<IThemeContextType | null>(null);

// Hook para usar o contexto estendido (Interface Segregation)
export const useExtendedTheme = (): IThemeContextType => {
  const context = useContext(ExtendedThemeContext);
  if (!context) {
    throw new Error(
      "useExtendedTheme must be used within an ExtendedThemeProvider",
    );
  }
  return context;
};

// Hook especializado para cores (Single Responsibility)
export const useThemeColors = () => {
  const { currentTheme, availableThemes, resolvedTheme } = useExtendedTheme();

  const getCurrentColors = () => {
    const theme = availableThemes.find((t) => t.id === currentTheme);
    if (!theme) return null;

    const mode = resolvedTheme === "dark" ? "dark" : "light";
    return theme.colors[mode];
  };

  return {
    colors: getCurrentColors(),
    mode: resolvedTheme as "light" | "dark",
  };
};

// Hook para apenas trocar tema (Single Responsibility)
export const useThemeActions = () => {
  const {
    setTheme,
    toggleTheme,
    registerTheme,
    unregisterTheme,
    updateThemeColors,
  } = useExtendedTheme();
  return {
    setTheme,
    toggleTheme,
    registerTheme,
    unregisterTheme,
    updateThemeColors,
  };
};

// Gerenciador de temas (Single Responsibility)
class ThemeManager {
  private themes: Map<string, ICustomTheme> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor(initialThemes: ICustomTheme[] = []) {
    initialThemes.forEach((theme) => this.themes.set(theme.id, theme));
  }

  // Registrar tema (Open/Closed Principle)
  registerTheme(theme: ICustomTheme): void {
    if (!ThemeFactory.validateTheme(theme)) {
      throw new Error(`Invalid theme: ${theme.id}`);
    }

    this.themes.set(theme.id, theme);
    this.applyThemeStyles(theme);
    this.notifyListeners();
  }

  // Remover tema
  unregisterTheme(themeId: string): void {
    this.themes.delete(themeId);
    this.removeThemeStyles(themeId);
    this.notifyListeners();
  }

  // Atualizar cores em tempo real
  updateThemeColors(
    themeId: string,
    mode: "light" | "dark",
    colors: Partial<IThemeColors>,
  ): void {
    const theme = this.themes.get(themeId);
    if (!theme) return;

    theme.colors[mode] = { ...theme.colors[mode], ...colors } as IThemeColors;
    this.applyThemeStyles(theme);
    this.notifyListeners();
  }

  // Aplicar estilos CSS do tema
  private applyThemeStyles(theme: ICustomTheme): void {
    const styleId = `theme-${theme.id}`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const lightCSS = this.generateCSSVariables(theme.colors.light);
    const darkCSS = this.generateCSSVariables(theme.colors.dark);

    styleElement.textContent = `
      [data-theme="${theme.id}"] {
        ${lightCSS}
      }
      [data-theme="${theme.id}"].dark {
        ${darkCSS}
      }
      ${theme.css || ""}
    `;
  }

  // Remover estilos CSS do tema
  private removeThemeStyles(themeId: string): void {
    const styleElement = document.getElementById(`theme-${themeId}`);
    if (styleElement) {
      styleElement.remove();
    }
  }

  // Gerar variáveis CSS
  private generateCSSVariables(colors: Record<string, string>): string {
    return Object.entries(colors)
      .map(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `--${cssVar}: ${value};`;
      })
      .join("\n        ");
  }

  // Observer Pattern
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  getThemes(): ICustomTheme[] {
    return Array.from(this.themes.values());
  }

  getTheme(id: string): ICustomTheme | undefined {
    return this.themes.get(id);
  }
}

// Provider Props
interface IExtendedThemeProviderProps {
  children: React.ReactNode;
  config?: Partial<IThemeConfig>;
}

// Componente Provider Principal
export function ExtendedThemeProvider({
  children,
  config = {},
}: IExtendedThemeProviderProps) {
  const defaultConfig: IThemeConfig = {
    defaultTheme: "default",
    enableSystem: true,
    themes: [
      ThemeFactory.createTheme("default", "Default"),
      ThemeFactory.createTheme("blue", "Blue", { preset: "blue" }),
      ThemeFactory.createTheme("green", "Green", { preset: "green" }),
      ThemeFactory.createTheme("orange", "Orange", { preset: "orange" }),
      ThemeFactory.createTheme("red", "Red", { preset: "red" }),
      ThemeFactory.createTheme("violet", "Violet", { preset: "violet" }),
      ThemeFactory.createTheme("slate", "Slate", { preset: "slate" }),
    ],
    storageKey: "theme",
    attribute: "data-theme",
  };

  const finalConfig = { ...defaultConfig, ...config };
  const [themeManager] = useState(() => new ThemeManager(finalConfig.themes));
  const [availableThemes, setAvailableThemes] = useState<ICustomTheme[]>(
    finalConfig.themes,
  );

  // Sincronizar temas quando manager muda
  useEffect(() => {
    const unsubscribe = themeManager.subscribe(() => {
      setAvailableThemes(themeManager.getThemes());
    });
    return unsubscribe;
  }, [themeManager]);

  return (
    <NextThemesProvider
      attribute={finalConfig.attribute}
      defaultTheme={finalConfig.defaultTheme}
      enableSystem={finalConfig.enableSystem}
      storageKey={finalConfig.storageKey}
      themes={availableThemes.map((t) => t.id)}
    >
      <ExtendedThemeProviderInner
        themeManager={themeManager}
        availableThemes={availableThemes}
      >
        {children}
      </ExtendedThemeProviderInner>
    </NextThemesProvider>
  );
}

// Provider interno que usa next-themes
interface IExtendedThemeProviderInnerProps {
  children: React.ReactNode;
  themeManager: ThemeManager;
  availableThemes: ICustomTheme[];
}

function ExtendedThemeProviderInner({
  children,
  themeManager,
  availableThemes,
}: IExtendedThemeProviderInnerProps) {
  const {
    theme: currentTheme,
    setTheme,
    systemTheme,
    resolvedTheme,
  } = useTheme();

  // Aplicar atributo data-theme ao body
  useEffect(() => {
    if (currentTheme) {
      document.body.setAttribute("data-theme", currentTheme);
    }
  }, [currentTheme]);

  // Toggle entre light/dark
  const toggleTheme = React.useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Context value (Single Responsibility)
  const contextValue: IThemeContextType = {
    currentTheme: currentTheme || "default",
    availableThemes,
    setTheme,
    toggleTheme,
    systemTheme: systemTheme as "light" | "dark" | undefined,
    resolvedTheme: resolvedTheme || "light",

    // Registro de temas (Open/Closed Principle)
    registerTheme: themeManager.registerTheme.bind(themeManager),
    unregisterTheme: themeManager.unregisterTheme.bind(themeManager),
    updateThemeColors: themeManager.updateThemeColors.bind(themeManager),
  };

  return (
    <ExtendedThemeContext.Provider value={contextValue}>
      {children}
    </ExtendedThemeContext.Provider>
  );
}

// Re-export do provider básico para compatibilidade
export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <ExtendedThemeProvider config={props}>{children}</ExtendedThemeProvider>
  );
}

// Hook para next-themes básico (compatibilidade)
export { useTheme } from "next-themes";
