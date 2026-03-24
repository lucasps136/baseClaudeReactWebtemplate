/**
 * TDD Tests for askQuestion()
 * These tests should FAIL initially until T007a implements the function.
 */
const routeCliUtils = require("../../../scripts/utils/route-cli-utils");

describe("askQuestion", () => {
  const originalIsTTY = process.stdin.isTTY;

  afterEach(() => {
    process.stdin.isTTY = originalIsTTY;
  });

  test("CI mode (isTTY=false) returns Promise<false> without opening readline", async () => {
    // Simulate CI environment — stdin is not a TTY
    Object.defineProperty(process.stdin, "isTTY", {
      value: false,
      writable: true,
      configurable: true,
    });

    const result = await routeCliUtils.askQuestion("Test question? (s/n): ");

    expect(result).toBe(false);
  });

  test("CI mode (isTTY=undefined) returns Promise<false>", async () => {
    Object.defineProperty(process.stdin, "isTTY", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const result = await routeCliUtils.askQuestion("Test question? (s/n): ");

    expect(result).toBe(false);
  });
});
