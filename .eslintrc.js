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

    // Technical debt: Complex hooks with multiple operations
    {
      files: [
        "src/features/users/hooks/useUsers.ts",
        "src/features/users/hooks/useUser.ts",
        "src/shared/hooks/use-rbac.ts",
      ],
      rules: {
        "max-lines-per-function": "off",
      },
    },

    // Technical debt: Zustand stores with multiple actions
    {
      files: ["src/features/users/stores/user.store.ts"],
      rules: {
        "max-lines-per-function": "off",
      },
    },

    // Technical debt: Middleware with example comments
    {
      files: ["src/middleware.ts"],
      rules: {
        "max-lines-per-function": "off",
      },
    },

    // Technical debt: Provider files with complex initialization
    {
      files: [
        "src/shared/components/providers/database-provider.tsx",
        "src/shared/services/database/providers/supabase/crud-operations.ts",
        "src/shared/services/payments/providers/stripe-payment-provider.ts",
        "src/shared/services/rbac/providers/supabase-rbac-provider.ts",
      ],
      rules: {
        "max-lines": "off",
      },
    },

    // Technical debt: Pure data file (theme color definitions)
    {
      files: ["src/shared/services/theme/theme-presets.ts"],
      rules: {
        "max-lines": "off",
      },
    },
  ],
};
