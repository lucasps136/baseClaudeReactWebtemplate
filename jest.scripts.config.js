/**
 * Jest configuration for Node.js script unit tests (CommonJS, no DOM).
 * Used by: tests/unit/scripts/
 */
module.exports = {
  displayName: "scripts",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/unit/scripts/**/*.test.js"],
  moduleFileExtensions: ["js", "json"],
  clearMocks: true,
};
