# Review Report: Card Animation System — T-4 Tests (RED Phase)

**Review Mode:** Incremental (T-4: Wire atomic card visual animation states) — Tests Only (RED Phase)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** spec.md, user-stories.md, bdd-test.md, design.md, tasks.md
**Scope:** Newly added animation-state tests in `card-visual.spec.ts`

## 1. Executive Summary

The RED-phase tests for T-4 are well-structured, meaningful, and demonstrate clear intent for the animation-state wiring that CardVisual must support. Tests use parameterised assertions for all five required animation states, verify selection distinctness from both capture and Escoba states, and confirm focus visibility preservation during Escoba emphasis. No critical or major gaps remain after the addition of the selected + Escoba coexistence test. Overall quality is high for a RED-phase suite.

- Total findings: 4 (0 Critical, 0 Major, 1 Minor, 2 Note, 1 Resolved)
- T-4 acceptance criteria coverage: 3 of 3 fully covered
- Test meaningfulness: Meaningful — all assertions verify specific DOM behaviour
- Traceability: Present via header comment; minor identifier mismatch with spec

## 2. T-4 Acceptance Criteria Coverage

| Acceptance Criterion                                                             | Status     | Evidence                                                                                 |
| -------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| AC-1: Visual states exist for play, capture, deal, opponent, and Escoba emphasis | ✅ Covered | `it.each` test asserts `card-visual--animation-{state}` class for all 5 states           |
| AC-2: Selection visual remains distinct from capture and Escoba states           | ✅ Covered | Tests verify selected + capture coexistence AND selected + Escoba coexistence            |
| AC-3: Focus visibility remains clear under animation states                      | ✅ Covered | Test asserts `card-visual--focus-visible` under Escoba (confirmed as highest-risk state) |

## 3. Findings

### RV-01: Selection distinctness from Escoba state [Resolved]

- **Category:** Test Coverage
- **Severity:** ~~Major~~ → Resolved
- **Related:** AC-2, FR-4, FR-6, US-4, US-6, SC-11, SC-14
- **Description:** Previously missing test for `card-visual--selected` coexisting with `card-visual--animation-escoba` has been added.
- **Resolution:** Test now asserts that when both `selected = true` and `animationState = 'escoba'` are active, both CSS classes are present simultaneously on the host element, completing AC-2 coverage.

### RV-02: No lifecycle test for animation state removal [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** AC-1, TR-2, AD-4
- **Description:** The parameterised `it.each` test verifies that setting an animation state applies the corresponding CSS class. However, there is no test verifying that when `animationState` transitions back to `null` or `'idle'`, the animation class is removed from the element.
- **Expected:** A test should assert that after an animation state is cleared (set to null or idle), no `card-visual--animation-*` class remains on the element.
- **Actual:** Only the "apply" direction of the class binding is tested; the "remove" direction is not.
- **Recommendation:** Add a test that sets an animation state, then resets it to null, and asserts the animation class is no longer present. This completes the state lifecycle verification.
- **Impact:** Low immediate risk since CSS class binding removal is typically symmetric in Angular, but explicit verification provides confidence for the GREEN implementation.

### RV-03: Traceability comment uses non-standard sub-identifiers [Note]

- **Category:** Test Quality
- **Severity:** Note
- **Related:** FR-4, FR-6, TR-2, NFR-2, NFR-7
- **Description:** The file header traceability comment references `FR-1.5`, `FR-6.2`, `TR-3.1`, `TR-3.2`, and `TR-6.2`. The specification document defines requirements as `FR-1` through `FR-8`, `TR-1` through `TR-8`, and `NFR-1` through `NFR-7` without decimal sub-numbering.
- **Expected:** Traceability references should map directly to identifiers in spec.md (e.g., FR-4, FR-6, TR-2, TR-3, TR-6).
- **Actual:** Sub-identifiers like `FR-1.5` and `TR-3.1` appear, which cannot be traced back to the specification without interpretation.
- **Recommendation:** Align traceability references to match spec.md identifiers. If sub-numbering is intentional for internal granularity, document the mapping.
- **Impact:** Informational only; does not affect test execution or correctness.

### RV-04: No explicit test for idle state behaviour [Note]

- **Category:** Test Coverage
- **Severity:** Note
- **Related:** AC-1, AD-4
- **Description:** The `CardVisualTestState` type includes `'idle'` as a valid animation state value, but the `it.each` array only covers the five active states (play, capture, deal, opponent, escoba). No test verifies the behaviour when `animationState = 'idle'`.
- **Expected:** If `idle` is a meaningful state in the type contract, its rendering behaviour should be specified — either it applies no animation class, or it applies a specific `card-visual--animation-idle` class.
- **Actual:** The idle state is defined in the type but not exercised in tests.
- **Recommendation:** If idle means "no animation class applied," add a test asserting that when `animationState = 'idle'`, no `card-visual--animation-*` class is present. If idle is treated identically to null, consider removing it from the type or documenting the equivalence.
- **Impact:** Informational; clarifies intent for the GREEN implementation.

## 4. Traceability Matrix

| Finding | Severity  | Category      | Related Spec                               | Status      |
| ------- | --------- | ------------- | ------------------------------------------ | ----------- |
| RV-01   | ~~Major~~ | Test Coverage | AC-2, FR-4, FR-6, US-4, US-6, SC-11, SC-14 | ✅ Resolved |
| RV-02   | Minor     | Test Coverage | AC-1, TR-2, AD-4                           | Open        |
| RV-03   | Note      | Test Quality  | FR-4, FR-6, TR-2, NFR-2, NFR-7             | Open        |
| RV-04   | Note      | Test Coverage | AC-1, AD-4                                 | Open        |

## 5. Test Quality Summary

| Test Description                                               | Meaningful | Assessment                                                            |
| -------------------------------------------------------------- | ---------- | --------------------------------------------------------------------- |
| Applies visual animation class for each state (it.each × 5)    | ✅ Yes     | Asserts specific CSS class on DOM element per state value             |
| Keeps selected style distinct when capture animation active    | ✅ Yes     | Verifies both classes coexist — tests a real distinctness concern     |
| Keeps selected style distinct when escoba animation active     | ✅ Yes     | Verifies both classes coexist — completes AC-2 coverage               |
| Keeps focus visibility class hook while escoba emphasis active | ✅ Yes     | Verifies focus-visible hook is preserved under highest-risk animation |

All newly added tests make genuine behavioural assertions against DOM output. No superficial (`toBeTruthy`/`toBeDefined`) or tautological patterns detected.

## 6. Spec Compliance Summary (T-4 Scope)

| Requirement | Status | Notes                                                                 |
| ----------- | ------ | --------------------------------------------------------------------- |
| FR-4        | ✅ Met | Selection feedback tested for both capture and Escoba distinctness    |
| FR-6        | ✅ Met | Escoba emphasis class tested; distinctness from selection verified    |
| TR-2        | ✅ Met | CSS class approach validates transform/opacity implementation path    |
| NFR-2       | ✅ Met | Focus visibility preservation tested for Escoba state                 |
| NFR-7       | ✅ Met | Escoba visual emphasis class is distinct from normal capture class    |
| US-4        | ✅ Met | Selection distinguishable from both capture and Escoba (tested)       |
| US-6        | ✅ Met | Escoba animation state produces distinct class from normal animations |

## 7. Task Completion Summary

| Task | Title                                    | Status                       | Findings                   |
| ---- | ---------------------------------------- | ---------------------------- | -------------------------- |
| T-4  | Wire atomic card visual animation states | ⚠️ Partial (RED phase tests) | RV-01, RV-02, RV-03, RV-04 |

## 8. Security Cross-Reference

No security concerns identified for this unit test review. The tests do not introduce DOM injection vectors, external resource loading, or credential exposure. Security report generation is not warranted for this scope.

## 9. Recommendations

### Major (fix before GREEN phase)

None — all major findings resolved.

### Minor (improvement)

1. Add a lifecycle test verifying animation class removal when state returns to null.

### Notes (informational)

1. Align traceability comment identifiers to spec.md conventions or document the sub-numbering scheme.
2. Clarify idle state intent — either test it explicitly or remove from the type contract.
