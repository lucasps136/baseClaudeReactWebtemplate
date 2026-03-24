/**
 * Remediation Contracts
 *
 * Defines contracts for tracking remediation progress of issues
 * identified in the /analyze report.
 *
 * Based on: Analysis Report (2025-10-28)
 * Findings: 2 CRITICAL, 7 HIGH, 8 MEDIUM, 2 LOW
 */

/**
 * TypeScript Error Remediation Contract
 *
 * Tracks systematic resolution of 80+ TypeScript errors
 * Priority: CRITICAL (C2)
 */
export interface TypeScriptRemediationContract {
  /** Total number of TypeScript errors initially found */
  totalErrors: 80;

  /** Errors categorized by type */
  categorized: {
    /** Import/module resolution errors (~30-40%) */
    importErrors: number;

    /** Type definition mismatches (~25-30%) */
    typeDefinitionErrors: number;

    /** Interface compatibility issues (~20-25%) */
    interfaceCompatibilityErrors: number;

    /** Other type errors (~10-20%) */
    otherErrors: number;
  };

  /** Number of errors fixed so far */
  fixedCount: number;

  /** Number of errors remaining */
  remainingCount: number;

  /** Current remediation phase */
  phase:
    | "categorization"
    | "imports"
    | "types"
    | "interfaces"
    | "other"
    | "complete";

  /** Success criteria met */
  successCriteria: {
    /** All errors categorized */
    allCategorized: boolean;

    /** All import errors fixed */
    importErrorsFixed: boolean;

    /** All type definition errors fixed */
    typeDefinitionErrorsFixed: boolean;

    /** All interface errors fixed */
    interfaceErrorsFixed: boolean;

    /** All other errors fixed */
    otherErrorsFixed: boolean;

    /** Zero errors in pnpm type-check */
    zeroErrors: boolean;
  };

  /** Timestamp of last update */
  lastUpdated: string;

  /** Overall progress percentage */
  progress: number;
}

/**
 * Specification Clarification Contract
 *
 * Tracks resolution of HIGH ambiguities from analysis
 * Priority: HIGH (A1-A4)
 */
export interface SpecificationClarificationContract {
  /** A1: Error response schema defined */
  errorResponseSchema: {
    resolved: boolean;
    decision: "RFC 7807-inspired ApiErrorResponse";
    documentedIn: "research.md";
    implementedIn: "error.interceptor.ts";
  };

  /** A2: Encryption decision matrix created */
  encryptionDecisionMatrix: {
    resolved: boolean;
    decision: "Data classification tree (MUST/MAY/NO encryption)";
    documentedIn: "research.md";
    implementedIn: "storage.service.ts";
  };

  /** A3: Performance metrics clarified */
  performanceMetricsClarity: {
    resolved: boolean;
    decision: "p95 < 100ms storage, p95 < 500ms API";
    documentedIn: "research.md";
    implementedIn: "performance benchmark tests";
  };

  /** A4: HTTP client decision documented */
  httpClientDocumentation: {
    resolved: boolean;
    decision: "Native Fetch with custom interceptors";
    documentedIn: "research.md section 1";
    alreadyImplemented: true;
  };

  /** All HIGH ambiguities resolved */
  allResolved: boolean;

  /** Timestamp of completion */
  completedAt: string | null;
}

/**
 * Constitution Remediation Contract
 *
 * Tracks resolution of constitution template issue
 * Priority: CRITICAL (C1)
 */
export interface ConstitutionRemediationContract {
  /** Constitution status */
  status: "empty-template" | "populated" | "acknowledged";

  /** User decision made */
  decisionMade: boolean;

  /** Selected option */
  selectedOption: "Option A - Populate" | "Option B - Acknowledge" | null;

  /** Constitution populated with principles */
  constitutionPopulated: boolean;

  /** Principles included */
  principlesIncluded: {
    solidPrinciples: boolean;
    testFirstDevelopment: boolean;
    typeScriptStrict: boolean;
    dryAndReuse: boolean;
    verticalSliceArchitecture: boolean;
  };

  /** Stack constraints documented */
  stackConstraintsDocumented: boolean;

  /** Quality gates defined */
  qualityGatesDefined: boolean;

  /** Version and ratification */
  version: string | null;
  ratifiedDate: string | null;

  /** Success criteria met */
  resolved: boolean;
}

/**
 * Underspecification Remediation Contract
 *
 * Tracks resolution of MEDIUM underspecifications
 * Priority: MEDIUM (U1-U3)
 */
export interface UnderspecificationRemediationContract {
  /** U1: Cookie security flags specified */
  cookieSecurityFlags: {
    resolved: boolean;
    decision: "OWASP standards (httpOnly, secure, sameSite)";
    documentedIn: "research.md";
  };

  /** U2: Storage quota management strategy defined */
  storageQuotaManagement: {
    resolved: boolean;
    decision: "LRU cleanup with 5MB threshold";
    documentedIn: "research.md";
  };

  /** U3: Cross-tab conflict resolution specified */
  crossTabConflictResolution: {
    resolved: boolean;
    decision: "Last-write-wins with timestamp priority";
    documentedIn: "research.md";
  };

  /** All underspecifications addressed */
  allResolved: boolean;
}

/**
 * Coverage Gap Remediation Contract
 *
 * Tracks resolution of missing task coverage
 * Priority: HIGH (O1-O2)
 */
export interface CoverageGapRemediationContract {
  /** O1: Dependency evaluation task added */
  dependencyEvaluation: {
    resolved: boolean;
    taskId: "T023" | "T029" | null;
    acceptanceCriteria: "All dependencies installed and documented";
  };

  /** O2: Out-of-scope validation task added */
  outOfScopeValidation: {
    resolved: boolean;
    taskId: "T042" | null;
    acceptanceCriteria: "No out-of-scope features implemented";
  };

  /** Missing requirement coverage added */
  missingRequirements: {
    validationService: boolean;
    breakingChangesCheck: boolean;
    architecturalPatternsValidation: boolean;
  };

  /** All coverage gaps addressed */
  allResolved: boolean;
}

/**
 * Inconsistency Remediation Contract
 *
 * Tracks resolution of documentation inconsistencies
 * Priority: MEDIUM (I1-I2, D1-D2)
 */
export interface InconsistencyRemediationContract {
  /** I1: Status field inconsistency resolved */
  statusFieldSync: {
    resolved: boolean;
    decision: "spec.md = requirements baseline, tasks.md = live tracker";
    action: "Document status semantics in plan.md";
  };

  /** I2: Date mismatch resolved */
  dateMismatch: {
    resolved: boolean;
    decision: "spec date = frozen requirements, tasks date = last update";
    action: "Document date semantics in plan.md";
  };

  /** D1: Interface naming convention clarified */
  interfaceNaming: {
    resolved: boolean;
    decision: "I-prefix for interfaces (IApiService)";
    action: "Add convention to spec.md";
  };

  /** D2: Implementation details moved from spec */
  implementationDetails: {
    resolved: boolean;
    action: "Keep requirements only in spec, details in plan";
  };

  /** Terminology drift documented */
  terminologyDriftResolved: boolean;

  /** All inconsistencies addressed */
  allResolved: boolean;
}

/**
 * Overall Remediation Progress
 *
 * Aggregate progress across all remediation contracts
 */
export interface RemediationProgress {
  /** Total issues identified */
  totalIssues: 27; // 2 CRITICAL + 7 HIGH + 8 MEDIUM + 2 LOW (from analysis)

  /** Issues resolved */
  resolvedIssues: number;

  /** Issues in progress */
  inProgressIssues: number;

  /** Issues not started */
  notStartedIssues: number;

  /** Progress by severity */
  bySeverity: {
    critical: {
      total: 2;
      resolved: number;
      remaining: number;
    };
    high: {
      total: 7;
      resolved: number;
      remaining: number;
    };
    medium: {
      total: 16; // 8 from analysis + 8 from inconsistencies
      resolved: number;
      remaining: number;
    };
    low: {
      total: 2;
      resolved: number;
      remaining: number;
    };
  };

  /** Contract statuses */
  contracts: {
    typescript: TypeScriptRemediationContract;
    specification: SpecificationClarificationContract;
    constitution: ConstitutionRemediationContract;
    underspecification: UnderspecificationRemediationContract;
    coverageGaps: CoverageGapRemediationContract;
    inconsistencies: InconsistencyRemediationContract;
  };

  /** Can proceed to production */
  readyForProduction: boolean;

  /** Blocking issues remaining */
  blockingIssuesRemaining: number;

  /** Last updated timestamp */
  lastUpdated: string;
}

/**
 * Remediation Milestone Tracker
 *
 * Key milestones in the remediation process
 */
export interface RemediationMilestones {
  /** Milestone: Constitution Decision Made */
  constitutionDecisionMade: {
    completed: boolean;
    completedAt: string | null;
    taskId: "T029";
  };

  /** Milestone: All CRITICAL Issues Resolved */
  criticalIssuesResolved: {
    completed: boolean;
    completedAt: string | null;
    taskIds: ["T029", "T030", "T031", "T032"];
  };

  /** Milestone: All HIGH Issues Resolved */
  highIssuesResolved: {
    completed: boolean;
    completedAt: string | null;
    taskIds: ["T033", "T034", "T035", "T036"];
  };

  /** Milestone: All Quality Gates Pass */
  qualityGatesPass: {
    completed: boolean;
    completedAt: string | null;
    taskIds: ["T037", "T038", "T039", "T040"];
  };

  /** Milestone: Final Validation Complete */
  finalValidationComplete: {
    completed: boolean;
    completedAt: string | null;
    taskIds: ["T041", "T042", "T043"];
  };

  /** Milestone: Production Ready */
  productionReady: {
    completed: boolean;
    completedAt: string | null;
    allTasksComplete: boolean;
  };
}
