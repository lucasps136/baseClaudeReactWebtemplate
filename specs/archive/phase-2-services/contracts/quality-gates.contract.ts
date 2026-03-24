/**
 * Quality Gates Contract
 *
 * Defines the quality gates that must pass before production deployment.
 * Based on Bebarter Constitution v1.0.0 and analysis findings.
 *
 * @see .specify/memory/constitution.md - Quality Gates section
 */

/**
 * Quality Gate: Zero TypeScript Errors
 *
 * Constitutional Requirement: TypeScript Strict Mode (NON-NEGOTIABLE)
 * Command: pnpm type-check
 * Success: Exit code 0, no errors
 */
export interface TypeScriptQualityGate {
  /** Command to execute */
  command: "pnpm type-check";

  /** Expected exit code for success */
  expectedExitCode: 0;

  /** Number of TypeScript errors (must be 0) */
  errorCount: 0;

  /** Error threshold - zero tolerance */
  threshold: "zero-errors";

  /** Severity classification */
  severity: "CRITICAL";

  /** Blocks production deployment */
  blocking: true;
}

/**
 * Quality Gate: Zero ESLint Errors
 *
 * Constitutional Requirement: Code Quality Gates
 * Command: pnpm lint
 * Success: Exit code 0, no errors (warnings acceptable with justification)
 */
export interface ESLintQualityGate {
  /** Command to execute */
  command: "pnpm lint";

  /** Expected exit code for success */
  expectedExitCode: 0;

  /** Number of ESLint errors (must be 0) */
  errorCount: 0;

  /** Warnings are acceptable if justified */
  warningsAcceptable: true;

  /** Maximum acceptable warnings */
  maxWarnings: 10;

  /** Severity classification */
  severity: "HIGH";

  /** Blocks production deployment */
  blocking: true;
}

/**
 * Quality Gate: Contract Tests Pass
 *
 * Constitutional Requirement: Test-First Development (NON-NEGOTIABLE)
 * Command: pnpm test -- contract tests
 * Success: All tests green, no failures
 */
export interface ContractTestQualityGate {
  /** Command to execute */
  command: "pnpm test -- **/*.contract.test.ts";

  /** Expected exit code for success */
  expectedExitCode: 0;

  /** Number of test failures (must be 0) */
  failureCount: 0;

  /** Test files to verify */
  testFiles: [
    "specs/master/contracts/tests/api-service.contract.test.ts",
    "specs/master/contracts/tests/storage-service.contract.test.ts",
    "specs/master/contracts/tests/integration.contract.test.ts",
  ];

  /** Severity classification */
  severity: "CRITICAL";

  /** Blocks production deployment */
  blocking: true;
}

/**
 * Quality Gate: Unit Tests Pass
 *
 * Constitutional Requirement: Test Coverage Requirements
 * Command: pnpm test
 * Success: All unit tests passing, minimum coverage met
 */
export interface UnitTestQualityGate {
  /** Command to execute */
  command: "pnpm test";

  /** Expected exit code for success */
  expectedExitCode: 0;

  /** Number of test failures (must be 0) */
  failureCount: 0;

  /** Minimum coverage percentage */
  minCoverage: {
    statements: 80;
    branches: 75;
    functions: 80;
    lines: 80;
  };

  /** Severity classification */
  severity: "HIGH";

  /** Blocks production deployment */
  blocking: true;
}

/**
 * Quality Gate: Performance Benchmarks
 *
 * Constitutional Requirement: Performance Standards
 * Metrics: p95 percentile measurements
 *
 * Storage: p95 < 100ms
 * API: p95 < 500ms
 */
export interface PerformanceQualityGate {
  /** Storage operations p95 latency (ms) - must be < 100 */
  storagep95: number;

  /** API operations p95 latency (ms) - must be < 500 */
  apip95: number;

  /** Minimum number of iterations for benchmark */
  iterations: 100;

  /** Percentile to measure (95th percentile) */
  percentile: 95;

  /** Storage threshold in milliseconds */
  storageThreshold: 100;

  /** API threshold in milliseconds */
  apiThreshold: 500;

  /** Severity classification */
  severity: "MEDIUM";

  /** Blocks production deployment */
  blocking: false;

  /** Warning - can proceed with justification */
  warningOnly: true;
}

/**
 * Quality Gate: Security Audit
 *
 * Constitutional Requirement: Security Requirements
 * Checklist: OWASP Top 10, secrets, encryption
 */
export interface SecurityQualityGate {
  /** OWASP Top 10 checklist - all must be true */
  owaspTop10: {
    a01_broken_access_control: boolean;
    a02_cryptographic_failures: boolean;
    a03_injection: boolean;
    a04_insecure_design: boolean;
    a05_security_misconfiguration: boolean;
    a06_vulnerable_components: boolean;
    a07_identification_auth_failures: boolean;
    a08_software_data_integrity: boolean;
    a09_logging_monitoring_failures: boolean;
    a10_server_side_request_forgery: boolean;
  };

  /** No hardcoded secrets in code */
  noHardcodedSecrets: boolean;

  /** Encryption properly implemented */
  encryptionValidated: boolean;

  /** RLS enabled on all tables */
  rlsEnabled: boolean;

  /** Cookie security flags verified */
  cookieSecurityFlags: boolean;

  /** CSP headers configured */
  cspConfigured: boolean;

  /** Severity classification */
  severity: "CRITICAL";

  /** Blocks production deployment */
  blocking: true;
}

/**
 * Quality Gate: No Breaking Changes
 *
 * Constitutional Requirement: Development Workflow
 * Verification: Existing functionality intact
 */
export interface BreakingChangesQualityGate {
  /** Existing tests still pass */
  existingTestsPass: boolean;

  /** No API contract breaking changes */
  noApiBreakingChanges: boolean;

  /** No removed public interfaces */
  noRemovedInterfaces: boolean;

  /** Backward compatibility maintained */
  backwardCompatible: boolean;

  /** Migration guide provided if needed */
  migrationGuideProvided: boolean;

  /** Severity classification */
  severity: "HIGH";

  /** Blocks production deployment */
  blocking: true;
}

/**
 * Quality Gate: Documentation Complete
 *
 * Constitutional Requirement: Documentation Requirements
 * Verification: All documentation updated
 */
export interface DocumentationQualityGate {
  /** quickstart.md updated with examples */
  quickstartUpdated: boolean;

  /** API documentation generated */
  apiDocsGenerated: boolean;

  /** Breaking changes documented */
  breakingChangesDocumented: boolean;

  /** Troubleshooting section added */
  troubleshootingAdded: boolean;

  /** README.md updated if needed */
  readmeUpdated: boolean;

  /** Severity classification */
  severity: "MEDIUM";

  /** Blocks production deployment */
  blocking: false;

  /** Warning - can proceed with justification */
  warningOnly: true;
}

/**
 * Quality Gate Execution Order
 *
 * Gates must be executed in this order for proper validation:
 * 1. TypeScript (blocking) - Must pass first
 * 2. ESLint (blocking) - Code quality
 * 3. Contract Tests (blocking) - Service contracts
 * 4. Unit Tests (blocking) - Code coverage
 * 5. Security Audit (blocking) - OWASP + secrets
 * 6. Breaking Changes (blocking) - Compatibility
 * 7. Performance (warning) - Can proceed with justification
 * 8. Documentation (warning) - Can proceed with justification
 */
export const QUALITY_GATE_EXECUTION_ORDER = [
  "typescript",
  "eslint",
  "contract-tests",
  "unit-tests",
  "security-audit",
  "breaking-changes",
  "performance",
  "documentation",
] as const;

/**
 * Quality Gate Summary
 *
 * Aggregate status of all quality gates
 */
export interface QualityGateSummary {
  /** Total number of gates */
  totalGates: number;

  /** Number of passing gates */
  passingGates: number;

  /** Number of failing gates */
  failingGates: number;

  /** Number of blocking gates failing */
  blockingFailures: number;

  /** Number of warning-only gates failing */
  warningFailures: number;

  /** Overall status */
  status: "PASS" | "FAIL" | "WARNING";

  /** Can deploy to production */
  canDeploy: boolean;

  /** Timestamp of validation */
  timestamp: string;

  /** Individual gate results */
  gates: {
    typescript: boolean;
    eslint: boolean;
    contractTests: boolean;
    unitTests: boolean;
    security: boolean;
    breakingChanges: boolean;
    performance: boolean;
    documentation: boolean;
  };
}
