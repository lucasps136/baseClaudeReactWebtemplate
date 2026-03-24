# CLI & Injection Correctness Checklist: Plugin-and-Play Route Automation

**Purpose**: Peer review gate validating requirement quality for CLI interaction and routes.ts injection across spec.md, plan.md, and tasks.md — before implementation merge.
**Created**: 2026-03-24
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [tasks.md](../tasks.md)
**Audience**: Peer reviewer (pre-merge)
**Depth**: Formal gate

---

## CLI Interaction — Requirement Completeness

- [ ] CHK001 - Are the exact wording of all prompts specified in spec or plan? (e.g., "🌐 Deseja criar uma rota…", "🔒 A rota deve ser protegida…") or only described behaviorally? [Completeness, Spec §US1]
- [ ] CHK002 - Is the accepted answer format for prompts unambiguously defined? (e.g., only `s`/`n` lowercase, or also `S`/`N` and full words like `sim`?) [Completeness, Gap]
- [ ] CHK003 - Is the behavior defined when the user provides an answer other than `s` or `n` (e.g., `y`, empty Enter, `1`)? [Completeness, Edge Case, Gap]
- [ ] CHK004 - Is the prompt sequence order (route? → protected?) formally specified, or only implied by the code snippet in plan.md? [Completeness, Spec §FR-003]
- [ ] CHK005 - Are informational messages shown after _not_ creating a route (answer `n`) fully specified with exact manual path instructions? [Completeness, Spec §US3, Tasks §T017]
- [ ] CHK006 - Is the conflict overwrite prompt wording specified and distinguishable from the initial route-creation prompt? [Completeness, Spec §FR-008, Tasks §T015]

---

## CLI Interaction — Requirement Clarity

- [ ] CHK007 - Is "modo CI" precisely and measurably defined? (`process.stdin.isTTY === false` vs `undefined` vs `falsy` — are all three cases covered?) [Clarity, Spec §US3, research.md]
- [ ] CHK008 - Is "safe default" in CI mode unambiguously quantified as _never create route_ for all prompt types, or only for the initial route prompt? [Clarity, Spec §US3 SC3]
- [ ] CHK009 - Are prompt messages for features and modules specified as distinct, or could they be confused? (both say "Deseja criar uma rota…" — is the module-specific context marker required?) [Clarity, Spec §US1 vs US2]
- [ ] CHK010 - Is the term "interação explícita do usuário" in FR-005 quantified as a specific prompt type (readline yes/no), or does it leave room for alternative implementations? [Clarity, Spec §FR-005]
- [ ] CHK011 - Is the requirement for displaying the generated URL in the success message measurably specified? (which format: `/automacoes` vs `http://localhost:3000/automacoes`?) [Clarity, Tasks §T014]

---

## CLI Interaction — Scenario Coverage

- [ ] CHK012 - Are requirements defined for the scenario where a user runs the generator in a Docker container or remote SSH session where `isTTY` may behave unexpectedly? [Coverage, Gap]
- [ ] CHK013 - Are requirements defined for the scenario where stdin is closed mid-prompt (readline `close` event fires before answer)? [Coverage, Exception Flow, Gap]
- [ ] CHK014 - Is the behavior specified when the feature name provided by the developer is empty or contains only whitespace? [Coverage, Edge Case, Gap]
- [ ] CHK015 - Are requirements for the `remove:feature` placeholder message consistent with the 4-step manual instructions listed in plan.md Fase D vs the "3 ações planejadas" mentioned in FR-012? [Consistency, Spec §FR-012 vs Tasks §T026]

---

## Injection Correctness — Requirement Completeness

- [ ] CHK016 - Is the exact injection position within `routes.protected: {` specified? (first position, last position, or alphabetical order?) [Completeness, research.md, Gap]
- [ ] CHK017 - Is the exact injection position within `routeGroups.protected: [` specified? (prepend, append, or sorted?) [Completeness, research.md, Gap]
- [ ] CHK018 - Is the trailing comma format for injected entries (`routeKey: "routePath",`) specified as mandatory, or is it implementation-defined? [Completeness, research.md]
- [ ] CHK019 - Is idempotency behavior precisely defined? (does re-running the generator with the same name silently skip, warn, or error?) [Completeness, Tasks §T004b(c)]
- [ ] CHK020 - Is the fallback message content for FR-010 (unexpected format) specified to include the _exact snippet to add manually_, or only a generic warning? [Completeness, Spec §FR-010]

---

## Injection Correctness — Requirement Clarity

- [ ] CHK021 - Is the `routeKey` format constraint (valid TypeScript identifier, no slashes, camelCase for modules) specified with examples for edge cases such as numbers (`2fa`), hyphens in module names (`my-module` → `myModule`)? [Clarity, Tasks §T006, T024]
- [ ] CHK022 - Is "formato inesperado" in FR-010 defined with objective criteria — what specific structural pattern must be absent for the fallback to trigger? [Clarity, Spec §FR-010, Ambiguity]
- [ ] CHK023 - Is the `[\s\S]*?` regex pattern for `routeGroups.protected` array match documented with an explanation of why `[^\]]*?` was insufficient? (prevents regression) [Clarity, research.md]
- [ ] CHK024 - Is the `routePathUrl` / `routePath` parameter name inconsistency between plan.md Fase A and research.md / tasks.md acknowledged and resolved formally? [Clarity, Consistency, plan.md Fase A vs Tasks §T006]

---

## Injection Correctness — Edge Cases

- [ ] CHK025 - Is behavior defined when `routes.protected: {` exists but `routeGroups.protected: [` is absent (only one of the two protected injection targets found)? [Edge Case, research.md, Gap]
- [ ] CHK026 - Is behavior defined for a `routeKey` collision where the key already exists in `routes.ts` but maps to a _different_ path? (idempotency check uses key presence only — is this sufficient?) [Edge Case, Tasks §T004b(c), Ambiguity]
- [ ] CHK027 - Is behavior defined when `src/config/routes.ts` does not exist at all (file missing entirely vs format mismatch)? [Edge Case, Spec §FR-010, Gap]
- [ ] CHK028 - Are requirements defined for feature names containing accented characters (e.g., `automações`) or Unicode? [Edge Case, Spec §EdgeCases, Gap]
- [ ] CHK029 - Is the behavior defined when `module.json` cannot be parsed as valid JSON during the route field update (T023)? [Edge Case, Tasks §T023, Gap]

---

## Generated File Quality Requirements

- [ ] CHK030 - Is the `page.tsx` template structure fully specified — must it include `className` in the `<main>` wrapper, or is the layout implementation-defined? [Completeness, research.md §Template]
- [ ] CHK031 - Is the requirement for the `// TODO: O componente importado abaixo ainda não foi criado.` comment format specified as exact wording, or only as a conceptual placeholder? [Clarity, Tasks §T005b]
- [ ] CHK032 - Are requirements for the `'use client'` placement in `${PascalCase}List.tsx` specified at the component-template level (first line before imports) or only described narratively? [Clarity, Spec §FR-004, Tasks §T002/T003]
- [ ] CHK033 - Is the `@/` path alias assumed to always resolve correctly, or are requirements defined for projects where `tsconfig.paths` is configured differently? [Assumption, Spec §Assumptions, Gap]

---

## Non-Functional Requirements & Consistency

- [ ] CHK034 - Are error/warning messages consistent in tone and format across all failure scenarios? (mix of `⚠️`, `❌`, `ℹ️` — is a style guide specified?) [Consistency, Gap]
- [ ] CHK035 - Is the performance requirement (< 3 seconds in plan.md vs < 60 seconds in SC-001 spec.md) reconciled? Are both targets for different phases of the flow? [Consistency, Spec §SC-001 vs plan.md §Technical Context]
- [ ] CHK036 - Are requirements symmetric between features (generate-feature.js) and modules UI (generate-module.js) for all shared behaviors: conflict detection, CI mode, auth prompt, routes.ts injection? [Consistency, Spec §FR-007b]
- [ ] CHK037 - Is the requirement that only `ui` category modules receive the route prompt specified with explicit exclusion of `logic`, `data`, and `integration` categories? [Completeness, Spec §EdgeCases]

---

## Dependencies & Assumptions Validation

- [ ] CHK038 - Is the assumption that `src/config/routes.ts` always contains both `routes.protected: {` and `routes.public: {` blocks formally documented and validated against the actual codebase? [Assumption, Spec §Assumptions]
- [ ] CHK039 - Is the assumption that the CLI always runs from the project root (relative paths like `src/app/...`) documented and are requirements defined for running from a subdirectory? [Assumption, plan.md §Technical Context, Gap]
- [ ] CHK040 - Is the dependency on `readline` (Node.js native) formally documented as a constraint, including the minimum Node.js version required for the `isTTY` property? [Dependency, research.md §1]
- [ ] CHK041 - Is the assumption about `module.json` schema (field `route` not conflicting with existing AI metadata fields) validated against the actual registry schema? [Assumption, Spec §FR-007, Gap]

---

## Notes

- Mark items as passing: `[x]`
- Mark items as failing with finding: `[x] CHK### — ⚠️ Issue: <description>`
- Items marked `[Gap]` indicate requirements potentially missing from spec/plan — confirm intentional exclusion or raise for author
- Items marked `[Ambiguity]` require author clarification before implementation
- Items marked `[Assumption]` require codebase validation before marking clear
