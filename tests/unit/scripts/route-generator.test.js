/**
 * TDD Tests for generateAppRoute()
 * These tests should FAIL initially until T005 implements the function.
 */
const path = require("path");

// Mock fs before requiring the module
jest.mock("fs");
const fs = require("fs");

const routeCliUtils = require("../../../scripts/utils/route-cli-utils");

describe("generateAppRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: file does not exist
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockReturnValue(undefined);
    fs.writeFileSync.mockReturnValue(undefined);
    // Mock process.cwd()
    jest.spyOn(process, "cwd").mockReturnValue("/fake/project");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("creates page.tsx with correct import path", () => {
    const result = routeCliUtils.generateAppRoute(
      "automacoes",
      "@/features/automacoes",
      "AutomacoesList",
      "AutomacoesPage",
    );

    expect(result.conflict).toBe(false);
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join("src", "app", "automacoes"),
      { recursive: true },
    );
    expect(fs.writeFileSync).toHaveBeenCalled();

    const writtenContent = fs.writeFileSync.mock.calls[0][1];
    expect(writtenContent).toContain(
      "import { AutomacoesList } from '@/features/automacoes'",
    );
    expect(writtenContent).toContain(
      "export default function AutomacoesPage()",
    );
  });

  test("returns { conflict: true } if page.tsx already exists", () => {
    // First call for component existence check, second for pageFile
    fs.existsSync.mockImplementation((p) => {
      if (p.includes("page.tsx")) return true;
      return false;
    });

    const result = routeCliUtils.generateAppRoute(
      "automacoes",
      "@/features/automacoes",
      "AutomacoesList",
      "AutomacoesPage",
    );

    expect(result.conflict).toBe(true);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test("creates parent directory automatically", () => {
    const result = routeCliUtils.generateAppRoute(
      "modules/teste-ui",
      "@/modules/ui/teste-ui",
      "TesteUiList",
      "TesteUiPage",
    );

    expect(result.conflict).toBe(false);
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.join("src", "app", "modules", "teste-ui"),
      { recursive: true },
    );
  });
});
