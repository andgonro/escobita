# Review Report: Card Animation System — T-13 Accessibility Verification (RED Phase, Tests Only — v2)

**Review Mode:** Incremental (T-13: Verify accessibility behavior under animation load)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** proposal.md, spec.md, user-stories.md, bdd-test.md, design.md, tasks.md
**Scope:** RED phase test coverage only — limited to the three files specified:

- `src/app/features/game-board/game-table-page/game-table-page.deal-opponent.spec.ts`
- `cypress/e2e/game-table-accessibility.feature`
- `cypress/e2e/game-table.ts`

**Previous review:** `review-report_T-13_red.md` (6 findings: 0 Critical, 1 Major, 3 Minor, 2 Note)

## 1. Executive Summary

The updates have resolved the Major finding from the previous review. A new E2E scenario and corresponding step definitions now verify that selection and capture outcomes remain distinguishable under reduced-motion conditions. All three T-13 acceptance criteria are now covered, with one qualifying as partial due to focus-visibility assertion scope.

- Total findings: 5 (0 Critical, 0 Major, 3 Minor, 2 Note)
- Acceptance criteria coverage: 3 of 3 covered (2 fully, 1 partially)
- Test meaningfulness: meaningful across all criteria
- Traceability: improved — AC3 now tested; SC-25 reference and scenario ID collision remain

## 2. Architecture Comparison

Not applicable for this test-only RED phase review. No architectural components were added or modified by T-13.

## 3. Resolution of Previous Findings

### RV-01 (previously Major): Selection and capture distinguishability without motion — RESOLVED

The E2E file now includes:

- Feature scenario "SC-21 - reduced-motion keeps selection and capture outcomes distinguishable" in `game-table-accessibility.feature`
- Step `Given('reduced-motion accessibility mode is enabled', ...)` opens the game with `prefers-reduced-motion: reduce` mocked via `matchMedia`
- Step `When('selection and capture feedback is exercised without motion', ...)` performs a full legal capture flow (hand card selection, table card selection, submission) under reduced-motion
- Step `Then('selection state and capture outcome remain distinguishable without motion', ...)` asserts:
  - No hand cards retain `aria-pressed="true"` after submission (selection state clears)
  - Table card count decreases by the captured subset size (capture outcome is visible)

This verifies that under reduced-motion, the two states produce distinguishable functional outcomes: selection is cleared programmatically, and capture physically removes cards. The test proves the user can observe the difference between "selected" and "captured" without relying on motion cues.

**Status:** Resolved. Downgraded from Major to closed.

## 4. Remaining Findings

### RV-02: SC-25 from card-animations BDD not referenced in T-13 tests [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** SC-25, NFR-2, US-4, US-14, T-13
- **Description:** The card-animations BDD document defines SC-25 ("Keyboard focus and navigation remain intact during animation") as the primary non-functional scenario for NFR-2 mapped to US-4 and US-14. None of the T-13 unit tests reference SC-25 in their titles or comments. Unit tests reference SC-20 and SC-23 which belong to the game-table-accessibility feature (different spec scope).
- **Expected:** T-13 tests should reference SC-25 for keyboard/focus stability during animation.
- **Actual:** Tests reference SC-20 and SC-23 from game-table-accessibility, not SC-25 from card-animations bdd-test.md.
- **Recommendation:** Add SC-25 to the existing T-13 unit test title annotations alongside or instead of SC-20/SC-23.
- **Impact:** Traceability audit searching for SC-25 coverage will not find it in T-13 tests.

### RV-03: US-4, US-9, and NFR-3 not directly referenced by T-13 unit tests [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** US-4, US-9, NFR-3, T-13
- **Description:** T-13 spec traceability declares NFR-2, NFR-3, US-4, US-9, and US-14. The unit tests only reference NFR-2 in their titles. The E2E scenario implicitly covers NFR-3 and US-9 through the reduced-motion flow but does not cite these IDs in the feature file.
- **Expected:** Each traceable requirement should appear in at least one test title or scenario name.
- **Actual:** NFR-3, US-4, US-9 absent from test annotations. US-14 also absent.
- **Recommendation:** When moving to GREEN phase, annotate the reduced-motion E2E scenario with NFR-3/US-9 references in a comment, and include US-4 in the unit test where card states are asserted.
- **Impact:** Requirement traceability gap in auditing tooling; no runtime impact.

### RV-04: E2E focus-visible assertion limited to single non-card element [Minor]

- **Category:** Test Quality
- **Severity:** Minor
- **Related:** NFR-2, SC-25, T-13 AC2
- **Description:** The step `Then('focused controls remain visibly focusable during animation load', ...)` asserts `:focus-visible` only on the confirm-turn button. Card elements (which are the targets of animation CSS classes) are not checked for focus indicator visibility.
- **Expected:** Since NFR-2 requires "focus outlines remain visible and unobstructed by animation effects," at least one card element carrying animation state should also be verified for `:focus-visible`.
- **Actual:** Only confirm-turn is checked. Cards receive animation-related classes (`deal`, `capture`, `opponent`) but their focus visibility is not asserted during animation load.
- **Recommendation:** Extend the Then step to also focus a hand card (which carries `aria-disabled="true"` during animation) and assert `:focus-visible` matches.
- **Impact:** A CSS regression where animation transform/glow suppresses the focus ring on card elements would go undetected by this E2E scenario.

### RV-05: E2E animation-load timing has no explicit animation-active guard [Note]

- **Category:** Test Quality
- **Severity:** Note
- **Related:** T-13, SC-25
- **Description:** The `When('action animations are active during turn sequencing', ...)` step triggers play submission and waits for awaiting-confirmation phase, but does not assert that animation CSS classes are actually present on card elements before the Then steps execute.
- **Expected:** A precondition guard confirming animation is active at assertion time.
- **Actual:** Relies on Cypress serial execution semantics and animation duration exceeding step execution time.
- **Recommendation:** Optional — add an assertion that at least one card carries an animation-related attribute (e.g., `aria-disabled="true"` on hand cards) before proceeding to Then steps.
- **Impact:** Low. Cypress execution model makes false passes unlikely, but the test would be more self-documenting.

### RV-06: Scenario ID collision between game-table-accessibility.feature and card-animations bdd-test.md [Note]

- **Category:** Test Coverage
- **Severity:** Note
- **Related:** SC-20, SC-21, SC-25, T-13
- **Description:** The game-table-accessibility.feature reuses SC-20 and SC-21 IDs for both baseline accessibility scenarios and the new T-13 animation-load variants. The card-animations bdd-test.md defines SC-20 as "Animation state updates do not alter rule outcomes" and SC-21 as "Animation interruption preserves game consistency" — different scenarios entirely. The new reduced-motion scenario also uses "SC-21" creating a three-way collision.
- **Expected:** Scenario IDs should be unique across specs to prevent confusion.
- **Actual:** SC-20 and SC-21 each refer to different things depending on context.
- **Recommendation:** Assign unique IDs to the T-13 animation-load variants (e.g., SC-25a, SC-25b, SC-25c, keeping them under the parent SC-25 from card-animations BDD).
- **Impact:** Audit confusion; no runtime impact.

## 5. Traceability Matrix

| Finding | Severity  | Category      | Related Spec                | Status      |
| ------- | --------- | ------------- | --------------------------- | ----------- |
| RV-01   | ~~Major~~ | Test Coverage | T-13 AC3, NFR-3, US-4, US-9 | ✅ Resolved |
| RV-02   | Minor     | Test Coverage | SC-25, NFR-2, US-4, US-14   | Open        |
| RV-03   | Minor     | Test Coverage | US-4, US-9, NFR-3, US-14    | Open        |
| RV-04   | Minor     | Test Quality  | NFR-2, SC-25, T-13 AC2      | Open        |
| RV-05   | Note      | Test Quality  | T-13, SC-25                 | Open        |
| RV-06   | Note      | Test Coverage | SC-20, SC-21, SC-25         | Open        |

## 6. T-13 Acceptance Criteria Coverage

| Criterion                                                          | Status     | Notes                                                                                                                   |
| ------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Keyboard navigation remains stable during all action animations    | ✅ Met     | Unit: aria-disabled preserves focus order; E2E: keyboard operability during animation load verified                     |
| Focus indicators remain visible and unobscured                     | ⚠️ Partial | E2E checks :focus-visible on action button; cards (animation targets) not checked (RV-04)                               |
| Selection and capture states remain distinguishable without motion | ✅ Met     | E2E: reduced-motion scenario verifies selection clears and capture removes cards — functional distinguishability proven |

## 7. Spec Compliance Summary (T-13 scope)

| Requirement | Status     | Notes                                                                                 |
| ----------- | ---------- | ------------------------------------------------------------------------------------- |
| NFR-2       | ⚠️ Partial | Keyboard stability fully tested; focus visibility partially verified (RV-04)          |
| NFR-3       | ✅ Met     | E2E reduced-motion scenario proves functional outcomes are distinguishable            |
| US-4        | ✅ Met     | Selection highlight vs capture outcome distinguishable under all modes                |
| US-9        | ✅ Met     | Reduced-motion path exercised via E2E with outcome verification                       |
| US-14       | ⚠️ Partial | Covered implicitly by keyboard stability tests; traceability reference absent (RV-03) |

## 8. Task Completion Summary

| Task | Title                                              | Status      | Findings                                        |
| ---- | -------------------------------------------------- | ----------- | ----------------------------------------------- |
| T-13 | Verify accessibility behavior under animation load | ✅ Complete | RV-02, RV-03, RV-04 (all Minor — none blocking) |

## 9. Test Coverage Summary

| Scenario                            | Step Definitions                | Meaningful | Findings |
| ----------------------------------- | ------------------------------- | ---------- | -------- |
| SC-25                               | ❌ No (not referenced by ID)    | N/A        | RV-02    |
| SC-20 (a11y animation-load variant) | ✅ Yes                          | ✅ Yes     | —        |
| SC-21 (a11y focus-visible variant)  | ✅ Yes                          | ⚠️ Partial | RV-04    |
| SC-21 (a11y reduced-motion variant) | ✅ Yes                          | ✅ Yes     | —        |
| SC-11 (distinguishability)          | ✅ Yes (via reduced-motion E2E) | ✅ Yes     | —        |

## 10. Test Quality Summary

| Test File                                             | Type      | Meaningful Assertions | Issues                                                                                  |
| ----------------------------------------------------- | --------- | --------------------- | --------------------------------------------------------------------------------------- |
| game-table-page.deal-opponent.spec.ts (T-13 tests)    | Unit      | ✅ Yes                | Assertions on aria-disabled, disabled=false, and document.activeElement are behavioural |
| game-table-accessibility.feature (animation variants) | E2E       | ✅ Yes                | Three scenarios with real user-flow assertions                                          |
| game-table.ts (animation-load + reduced-motion steps) | E2E Steps | ✅ Yes                | Steps perform full interaction flows with outcome-based assertions                      |

## 11. Security Cross-Reference

T-13 is a pure accessibility verification task with no new services, data handling, external inputs, or state mutations. No security-relevant surface area is introduced. No security findings apply.

## 12. Recommendations

### Minor (improvement, non-blocking)

1. **Reference SC-25 in T-13 test annotations** (RV-02): Align traceability with card-animations BDD.
2. **Add NFR-3, US-4, US-9, US-14 references** (RV-03): Annotate tests for requirement audit trail.
3. **Extend E2E focus-visible to a card element** (RV-04): Verify `:focus-visible` on a hand card during animation load.

### Notes (informational)

4. **Consider animation-active precondition guard** (RV-05): Optional self-documentation improvement.
5. **Disambiguate SC-ID collisions** (RV-06): Assign unique IDs to animation-load variants.
