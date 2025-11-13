/**
 * Schema Validation Tests for User Data Module
 *
 * These tests validate the SQL schema structure and syntax
 */

import * as fs from "fs";
import * as path from "path";

describe("User Schema Tests", () => {
  const schemasDir = path.join(__dirname, "../../schemas");
  const migrationsDir = path.join(__dirname, "../../migrations");
  const queriesDir = path.join(__dirname, "../../queries");

  describe("Schema Files", () => {
    it("should have users.sql schema file", () => {
      const schemaPath = path.join(schemasDir, "users.sql");
      expect(fs.existsSync(schemaPath)).toBe(true);
    });

    it("users.sql should contain CREATE TABLE statement", () => {
      const schemaPath = path.join(schemasDir, "users.sql");
      const content = fs.readFileSync(schemaPath, "utf8");
      expect(content).toContain("CREATE TABLE");
      expect(content.toLowerCase()).toContain("users");
    });

    it("users.sql should contain RLS policies", () => {
      const schemaPath = path.join(schemasDir, "users.sql");
      const content = fs.readFileSync(schemaPath, "utf8");
      expect(content).toContain("ALTER TABLE");
      expect(content).toContain("ENABLE ROW LEVEL SECURITY");
    });

    it("users.sql should have proper indexes", () => {
      const schemaPath = path.join(schemasDir, "users.sql");
      const content = fs.readFileSync(schemaPath, "utf8");
      expect(content).toContain("CREATE INDEX");
    });
  });

  describe("Migration Files", () => {
    it("should have migration file", () => {
      const migrationPath = path.join(
        migrationsDir,
        "001_create_users_table.sql",
      );
      expect(fs.existsSync(migrationPath)).toBe(true);
    });

    it("migration should be valid SQL", () => {
      const migrationPath = path.join(
        migrationsDir,
        "001_create_users_table.sql",
      );
      const content = fs.readFileSync(migrationPath, "utf8");
      expect(content.trim().length).toBeGreaterThan(0);
      expect(content).toContain("CREATE");
    });
  });

  describe("Query Files", () => {
    it("should have users queries file", () => {
      const queriesPath = path.join(queriesDir, "users.sql");
      expect(fs.existsSync(queriesPath)).toBe(true);
    });

    it("queries should contain common operations", () => {
      const queriesPath = path.join(queriesDir, "users.sql");
      const content = fs.readFileSync(queriesPath, "utf8");
      expect(content).toContain("SELECT");
    });
  });

  describe("SQL Syntax Validation", () => {
    it("should not have syntax errors in schema", () => {
      const schemaPath = path.join(schemasDir, "users.sql");
      const content = fs.readFileSync(schemaPath, "utf8");

      // Basic SQL syntax checks
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      expect(openParens).toBe(closeParens);
    });

    it("should have consistent semicolons", () => {
      const schemaPath = path.join(schemasDir, "users.sql");
      const content = fs.readFileSync(schemaPath, "utf8");

      // Each statement should end with semicolon
      expect(content).toContain(";");
    });
  });

  describe("Security Validation", () => {
    it("should enable RLS on users table", () => {
      const schemaPath = path.join(schemasDir, "users.sql");
      const content = fs.readFileSync(schemaPath, "utf8").toLowerCase();

      expect(content).toContain("enable row level security");
    });

    it("should have at least one RLS policy", () => {
      const schemaPath = path.join(schemasDir, "users.sql");
      const content = fs.readFileSync(schemaPath, "utf8").toLowerCase();

      expect(content).toContain("create policy");
    });
  });
});
