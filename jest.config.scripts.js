/**
 * Jest configuration for CLI scripts tests
 * These are pure Node.js tests (no JSX, no Next.js)
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/unit/scripts/**/*.test.js"],
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
};
