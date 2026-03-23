# Tasks: Modular Architecture - Phase 6 Production Integration

**Input**: Design documents from `/specs/master/`
**Prerequisites**: plan.md, spec.md (Phases 1-5 complete)
**Date**: 2025-12-08

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1=Products, US2=Orders, US3=Payments, US4=App Integration, US5=CI/CD)
- Include exact file paths in descriptions

## Resumo Executivo

**Status Anterior**: Fases 1-5 completas (92% - 120/131 tasks)
**Foco Atual**: Fase 6 - Produção (19 novas tasks)
**Módulos Estáveis**: user-profile-ui, user-logic, user-data
**Módulos Experimentais**: products-*, orders-*, payments-* (precisam ser finalizados)

---

## Phase 1: Validation (Pre-requisites Check)

**Purpose**: Validate Phase 5 completion before proceeding

- [ ] T001 Validate existing modules with `npm run modules:validate`
- [ ] T002 [P] Run quality check with `npm run quality:check` (expect score >70)
- [ ] T003 [P] Run test coverage with `npm run test:modules:coverage` (expect >70%)

**Checkpoint**: All validation passing - Phase 6 can proceed

---

## Phase 2: User Story 1 - Products Module Finalization (Priority: P1)

**Goal**: Transform products-* modules from experimental to stable status

**Independent Test**: `npm run modules:validate` passes for all products-* modules with complete manifests

### Implementation for User Story 1

- [ ] T004 [US1] Analyze src/features/products/ for migration in `src/features/products/`
- [ ] T005 [P] [US1] Complete products-ui components in `modules/ui/products-ui/src/components/ProductList.tsx`
- [ ] T006 [P] [US1] Complete products-ui hooks in `modules/ui/products-ui/src/hooks/useProducts.ts`
- [ ] T007 [P] [US1] Complete products-ui store in `modules/ui/products-ui/src/stores/products.store.ts`
- [ ] T008 [US1] Complete products-logic service with SOLID patterns in `modules/logic/products-logic/src/services/products.service.ts`
- [ ] T009 [P] [US1] Complete products-logic validations in `modules/logic/products-logic/src/validations/products.validation.ts`
- [ ] T010 [US1] Complete products-data schemas in `modules/data/products-data/schemas/products.sql`
- [ ] T011 [US1] Update module.json with complete AI metadata in `modules/ui/products-ui/module.json`
- [ ] T012 [P] [US1] Update module.json with complete AI metadata in `modules/logic/products-logic/module.json`
- [ ] T013 [P] [US1] Update module.json with complete AI metadata in `modules/data/products-data/module.json`
- [ ] T014 [US1] Sync registry after products completion with `npm run modules:sync`

**Checkpoint**: Products modules stable, registry synced

---

## Phase 3: User Story 2 - Orders Module Finalization (Priority: P2)

**Goal**: Transform orders-* modules from experimental to stable status

**Independent Test**: `npm run modules:validate` passes for all orders-* modules with complete manifests

### Implementation for User Story 2

- [ ] T015 [US2] Analyze src/features/orders/ for migration in `src/features/orders/`
- [ ] T016 [P] [US2] Complete orders-ui components in `modules/ui/orders-ui/src/components/OrderList.tsx`
- [ ] T017 [P] [US2] Complete orders-ui hooks in `modules/ui/orders-ui/src/hooks/useOrders.ts`
- [ ] T018 [P] [US2] Complete orders-ui store in `modules/ui/orders-ui/src/stores/orders.store.ts`
- [ ] T019 [US2] Complete orders-logic service with SOLID patterns in `modules/logic/orders-logic/src/services/orders.service.ts`
- [ ] T020 [P] [US2] Complete orders-logic validations in `modules/logic/orders-logic/src/validations/orders.validation.ts`
- [ ] T021 [US2] Complete orders-data schemas in `modules/data/orders-data/schemas/orders.sql`
- [ ] T022 [US2] Update all orders module.json with complete AI metadata
- [ ] T023 [US2] Sync registry after orders completion with `npm run modules:sync`

**Checkpoint**: Orders modules stable, registry synced

---

## Phase 4: User Story 3 - Payments Module Finalization (Priority: P3)

**Goal**: Transform payments-* modules from experimental to stable status

**Independent Test**: `npm run modules:validate` passes for all payments-* modules with complete manifests

### Implementation for User Story 3

- [ ] T024 [US3] Analyze src/features/payments/ for migration in `src/features/payments/`
- [ ] T025 [P] [US3] Complete payments-ui components in `modules/ui/payments-ui/src/components/PaymentList.tsx`
- [ ] T026 [P] [US3] Complete payments-ui hooks in `modules/ui/payments-ui/src/hooks/usePayments.ts`
- [ ] T027 [P] [US3] Complete payments-ui store in `modules/ui/payments-ui/src/stores/payments.store.ts`
- [ ] T028 [US3] Complete payments-logic service with SOLID patterns in `modules/logic/payments-logic/src/services/payments.service.ts`
- [ ] T029 [P] [US3] Complete payments-logic validations in `modules/logic/payments-logic/src/validations/payments.validation.ts`
- [ ] T030 [US3] Complete payments-data schemas in `modules/data/payments-data/schemas/payments.sql`
- [ ] T031 [US3] Update all payments module.json with complete AI metadata
- [ ] T032 [US3] Sync registry after payments completion with `npm run modules:sync`

**Checkpoint**: Payments modules stable, registry synced

---

## Phase 5: User Story 4 - Next.js App Integration (Priority: P1)

**Goal**: Update Next.js app to import from @/modules/ instead of src/features/

**Independent Test**: `npm run dev` runs without errors, SSR works correctly

### Implementation for User Story 4

- [ ] T033 [US4] Audit all imports from src/features/ across the app with `grep -r "from.*features/" src/`
- [ ] T034 [P] [US4] Update user-related imports to @/modules/ui/user-profile-ui in `src/app/`
- [ ] T035 [P] [US4] Update product-related imports to @/modules/ui/products-ui in `src/app/`
- [ ] T036 [P] [US4] Update order-related imports to @/modules/ui/orders-ui in `src/app/`
- [ ] T037 [P] [US4] Update payment-related imports to @/modules/ui/payments-ui in `src/app/`
- [ ] T038 [US4] Test SSR rendering with `npm run build && npm run start`
- [ ] T039 [US4] Test client-side hydration in development mode
- [ ] T040 [US4] Verify no breaking changes with manual smoke test

**Checkpoint**: App running with modular imports, no breaking changes

---

## Phase 6: User Story 5 - CI/CD & Quality Gates (Priority: P2)

**Goal**: Setup automated quality validation on every PR

**Independent Test**: GitHub Actions workflow runs and passes on push

### Implementation for User Story 5

- [ ] T041 [US5] Create GitHub Actions workflow in `.github/workflows/quality.yml`
- [ ] T042 [P] [US5] Add type-check step to workflow
- [ ] T043 [P] [US5] Add lint step to workflow
- [ ] T044 [P] [US5] Add test step to workflow
- [ ] T045 [P] [US5] Add modules:validate step to workflow
- [ ] T046 [US5] Add build verification step to workflow
- [ ] T047 [US5] Configure branch protection rules for quality gates
- [ ] T048 [US5] Test workflow with a test PR

**Checkpoint**: CI/CD pipeline operational, PRs blocked on quality failure

---

## Phase 7: Polish & Production Deployment

**Purpose**: Final validation and production deployment

- [ ] T049 Run final quality check with `npm run quality:check` (expect score >85)
- [ ] T050 [P] Run final test coverage with `npm run test:modules:coverage` (expect >90%)
- [ ] T051 [P] Run modules metrics with `npm run modules:metrics`
- [ ] T052 Production build verification with `npm run build`
- [ ] T053 Update all module status from experimental to stable
- [ ] T054 Final registry sync with `npm run modules:sync`
- [ ] T055 Update documentation with Phase 6 completion in `docs/modular-architecture/`
- [ ] T056 Deploy to production environment
- [ ] T057 Post-deployment smoke test and monitoring

**Checkpoint**: Production deployed, all modules stable, documentation complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Validation)**: No dependencies - must pass before proceeding
- **Phases 2-4 (Products, Orders, Payments)**: Depend on Phase 1 - CAN run in parallel
- **Phase 5 (App Integration)**: Depends on Phases 2-4 completion
- **Phase 6 (CI/CD)**: Can run in parallel with Phase 5
- **Phase 7 (Polish)**: Depends on Phases 5-6 completion

### User Story Independence

- **US1 (Products)**: Independent - can start after Phase 1
- **US2 (Orders)**: Independent - can start after Phase 1, parallel with US1
- **US3 (Payments)**: Independent - can start after Phase 1, parallel with US1/US2
- **US4 (App Integration)**: Depends on US1, US2, US3 completion
- **US5 (CI/CD)**: Independent of US1-US3, can run after Phase 1

### Within Each User Story

- Analysis task first
- UI, Logic, Data tasks can run in parallel [P]
- module.json updates after implementation
- Registry sync after all module updates

---

## Parallel Execution Examples

### Parallel: Products Module (Phase 2)

```bash
# After T004 (analysis) completes, launch in parallel:
Task: "T005 [P] [US1] Complete products-ui components"
Task: "T006 [P] [US1] Complete products-ui hooks"
Task: "T007 [P] [US1] Complete products-ui store"
```

### Parallel: All Modules (Phases 2-4)

```bash
# After Phase 1 validation, launch all three domains in parallel:
Task: "T004 [US1] Analyze products" → leads to Products module work
Task: "T015 [US2] Analyze orders" → leads to Orders module work
Task: "T024 [US3] Analyze payments" → leads to Payments module work
```

### Parallel: App Import Updates (Phase 5)

```bash
# After audit (T033), update all imports in parallel:
Task: "T034 [P] [US4] Update user imports"
Task: "T035 [P] [US4] Update product imports"
Task: "T036 [P] [US4] Update order imports"
Task: "T037 [P] [US4] Update payment imports"
```

---

## Implementation Strategy

### MVP First (Products Only)

1. Complete Phase 1: Validation
2. Complete Phase 2: Products Module (US1)
3. **STOP and VALIDATE**: Test products module independently
4. Proceed to App Integration for products only

### Incremental Delivery

1. Phase 1 → Validation passed
2. Phase 2 (Products) → Products stable → Integrate in app
3. Phase 3 (Orders) → Orders stable → Integrate in app
4. Phase 4 (Payments) → Payments stable → Integrate in app
5. Each domain adds value independently

### Parallel Team Strategy

With multiple developers:
1. All complete Phase 1 together
2. Once validation passes:
   - Developer A: Products (US1)
   - Developer B: Orders (US2)
   - Developer C: Payments (US3)
   - Developer D: CI/CD (US5)
3. All reconvene for Phase 5 (App Integration) and Phase 7 (Polish)

---

## Metrics Summary

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Modules Total | 12 | 12 | ✅ |
| Stable Modules | 3 (users) | 12 | 🚧 Phase 6 |
| Test Coverage | 98.24% | >70% | ✅ |
| Quality Score | 92/100 | >70 | ✅ |
| Discovery Time | 69ms | <100ms | ✅ |

---

## Comandos Úteis

```bash
# Validação
npm run modules:validate
npm run quality:check
npm run test:modules:coverage
npm run modules:metrics

# Desenvolvimento
npm run modules:sync
npm run modules:search "<keyword>"
npm run modules:suggest "<task>"

# Build
npm run build
npm run dev
npm run type-check
npm run lint
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All experimental modules must become stable before Phase 7

**Total Tasks**: 57 (T001-T057)
**Tasks per User Story**: US1=11, US2=9, US3=9, US4=8, US5=8, Validation=3, Polish=9
**Parallel Opportunities**: 35 tasks marked [P]
**Suggested MVP**: Complete US1 (Products) + US4 (partial integration)
