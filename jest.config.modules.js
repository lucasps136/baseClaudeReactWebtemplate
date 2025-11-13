const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  displayName: "modules",
  testEnvironment: "jest-environment-jsdom",

  // Test match patterns - only test files in modules directory
  testMatch: [
    "<rootDir>/modules/**/*.test.ts",
    "<rootDir>/modules/**/*.test.tsx",
    "<rootDir>/modules/**/*.spec.ts",
    "<rootDir>/modules/**/*.spec.tsx",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/out/",
    "<rootDir>/build/",
  ],

  // Module paths mapping - align with tsconfig.json
  moduleNameMapper: {
    // Handle module aliases
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/components/(.*)$": "<rootDir>/src/shared/components/$1",
    "^@/lib/(.*)$": "<rootDir>/src/shared/utils/$1",
    "^@/types/(.*)$": "<rootDir>/src/shared/types/$1",
    "^@/config/(.*)$": "<rootDir>/src/config/$1",
    "^@/hooks/(.*)$": "<rootDir>/src/shared/hooks/$1",
    "^@/utils/(.*)$": "<rootDir>/src/shared/utils/$1",
    "^@/shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@/modules/(.*)$": "<rootDir>/modules/$1",
    "^@/modules/ui/(.*)$": "<rootDir>/modules/ui/$1",
    "^@/modules/logic/(.*)$": "<rootDir>/modules/logic/$1",
    "^@/modules/data/(.*)$": "<rootDir>/modules/data/$1",
    "^@/modules/integration/(.*)$": "<rootDir>/modules/integration/$1",

    // Handle CSS imports (with CSS modules)
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",

    // Handle image imports
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i":
      "<rootDir>/__mocks__/fileMock.js",
  },

  // Coverage configuration
  collectCoverageFrom: [
    "modules/**/src/components/**/*.{ts,tsx}",
    "modules/**/src/hooks/**/*.{ts,tsx}",
    "modules/**/src/services/**/*.{ts,tsx}",
    "modules/**/src/stores/**/*.{ts,tsx}",
    "modules/**/src/repositories/**/*.{ts,tsx}",
    "modules/**/src/validations/**/*.{ts,tsx}",
    // Exclude
    "!modules/**/src/**/*.d.ts",
    "!modules/**/src/**/*.stories.{ts,tsx}",
    "!modules/**/src/**/*.config.{ts,tsx}",
    "!modules/**/index.ts",
    "!modules/**/src/types/**/*",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
