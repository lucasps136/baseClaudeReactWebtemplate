module.exports = {
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // SOLID Principles enforcement
    "max-lines-per-function": ["warn", { max: 50 }],
    complexity: ["warn", { max: 10 }],
    "max-params": ["warn", { max: 4 }],

    // Architecture rules
    "no-relative-imports": "off", // Permitir imports relativos dentro de features
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",

    // Import organization
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],

    // Prevent God Classes/Functions
    "max-lines": ["warn", { max: 300 }],
    "max-depth": ["warn", { max: 4 }],

    // Naming conventions
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "interface",
        format: ["PascalCase"],
        prefix: ["I"],
        filter: {
          regex: "^(Props|State|Store)$",
          match: false,
        },
      },
      {
        selector: "typeAlias",
        format: ["PascalCase"],
      },
      {
        selector: "class",
        format: ["PascalCase"],
      },
    ],
  },
  overrides: [
    // Features specific rules
    {
      files: ["src/features/**/*.ts", "src/features/**/*.tsx"],
      rules: {
        // Disabled: Features use relative imports internally for better encapsulation
        // External features should import from feature's main index.ts
        "import/no-relative-parent-imports": "off",
      },
    },

    // Services must follow SOLID
    {
      files: ["**/*.service.ts"],
      rules: {
        "max-lines-per-function": ["error", { max: 30 }],
        complexity: ["error", { max: 5 }],
      },
    },

    // Store files
    {
      files: ["**/*.store.ts"],
      rules: {
        "@typescript-eslint/explicit-function-return-type": "error",
      },
    },
  ],
};
