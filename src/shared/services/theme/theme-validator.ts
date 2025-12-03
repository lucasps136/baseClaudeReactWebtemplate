// Theme validator - Single Responsibility: Validate theme structure
import type { ICustomTheme } from "@/shared/types/theme";

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

export class ThemeValidator {
  static validateTheme(theme: ICustomTheme): boolean {
    const hasAllLightColors = requiredColorKeys.every(
      (key) => key in theme.colors.light,
    );
    const hasAllDarkColors = requiredColorKeys.every(
      (key) => key in theme.colors.dark,
    );

    return hasAllLightColors && hasAllDarkColors;
  }

  static extractHue(hslColor: string): string {
    const match = hslColor.match(/(\d+(?:\.\d+)?)\s+/);
    return match ? match[1] : "221.2";
  }
}
