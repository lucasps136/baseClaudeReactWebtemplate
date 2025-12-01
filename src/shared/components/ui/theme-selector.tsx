"use client";

import * as React from "react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import {
  useExtendedTheme,
  useTheme,
} from "@/shared/components/providers/theme-provider";

// Componente para trocar entre light/dark/system (Single Responsibility)
export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente para seleção de cores de tema (Single Responsibility)
export function ThemeColorSelector() {
  const { availableThemes, currentTheme, setTheme } = useExtendedTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select theme color</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Theme Colors</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className="flex items-center justify-between"
          >
            <span>{theme.name}</span>
            {currentTheme === theme.id && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente combinado (Composite Pattern)
export function ThemeSelector() {
  return (
    <div className="flex items-center gap-2">
      <ThemeColorSelector />
      <ThemeToggle />
    </div>
  );
}

// Componente para preview de cores do tema (Single Responsibility)
interface IThemePreviewProps {
  themeId: string;
  className?: string;
}

export function ThemePreview({ themeId, className }: IThemePreviewProps) {
  const { availableThemes } = useExtendedTheme();
  const theme = availableThemes.find((t) => t.id === themeId);

  if (!theme) return null;

  return (
    <div className={`flex gap-1 ${className}`}>
      <div
        className="w-4 h-4 rounded-sm border"
        style={{ backgroundColor: `hsl(${theme.colors.light.primary})` }}
        title={`${theme.name} - Primary`}
      />
      <div
        className="w-4 h-4 rounded-sm border"
        style={{ backgroundColor: `hsl(${theme.colors.light.secondary})` }}
        title={`${theme.name} - Secondary`}
      />
      <div
        className="w-4 h-4 rounded-sm border"
        style={{ backgroundColor: `hsl(${theme.colors.light.accent})` }}
        title={`${theme.name} - Accent`}
      />
    </div>
  );
}

// Grid de seleção visual de temas (Single Responsibility)
export function ThemeGrid() {
  const { availableThemes, currentTheme, setTheme } = useExtendedTheme();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {availableThemes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => setTheme(theme.id)}
          className={`group relative rounded-lg border-2 p-4 text-left transition-colors hover:border-primary ${
            currentTheme === theme.id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{theme.name}</span>
            {currentTheme === theme.id && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </div>
          <ThemePreview themeId={theme.id} className="mt-2" />
        </button>
      ))}
    </div>
  );
}
