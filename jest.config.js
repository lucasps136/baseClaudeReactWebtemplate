const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",

  // Test match patterns
  testMatch: [
    "<rootDir>/**/*.test.ts",
    "<rootDir>/**/*.test.tsx",
    "<rootDir>/**/*.spec.ts",
    "<rootDir>/**/*.spec.tsx",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/out/",
    "<rootDir>/build/",
    "<rootDir>/tests/example.spec.ts",
    "<rootDir>/tests/test-template.js",
    "<rootDir>/specs/archive/",
    "<rootDir>/modules/logic/payments-logic/tests/services/PaymentsService.test.ts",
    "<rootDir>/modules/logic/products-logic/tests/services/ProductsService.test.ts",
    "<rootDir>/modules/data/products-data/tests/queries/products.queries.test.ts",
    "<rootDir>/modules/logic/orders-logic/tests/services/OrdersService.test.ts",
    "<rootDir>/modules/ui/user-profile-ui/tests/hooks/useUsers.test.ts",
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

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Clear mocks between tests
  clearMocks: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
