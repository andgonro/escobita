# Review Report: Card Animation System — T-13 Accessibility Verification (RED Phase, Tests Only)

**Review Mode:** Incremental (T-13: Verify accessibility behavior under animation load)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** proposal.md, spec.md, user-stories.md, bdd-test.md, design.md, tasks.md
**Scope:** RED phase test coverage only — limited to the three files specified:

- `src/app/features/game-board/game-table-page/game-table-page.deal-opponent.spec.ts`
- `cypress/e2e/game-table-accessibility.feature`
- `cypress/e2e/game-table.ts`

## 1. Executive Summary

The T-13 RED tests provide meaningful coverage for two of three acceptance criteria (keyboard stability and focus visibility during animation). However, the third criterion — selection and capture state distinguishability without motion — has **no test coverage** across any of the reviewed files. Traceability to the card-animations BDD scenarios is misaligned: tests reference SC-20/SC-23 from the game-table-accessibility feature (a different spec) rather than SC-25 from the card-animations BDD. NFR-3, US-4, and US-9 are not referenced by any T-13 test.

- Total findings: 6 (0 Critical, 1 Major, 3 Minor, 2 Note)
- Acceptance criteria coverage: 2 of 3 fully covered, 1 not covered
- Test meaningfulness: meaningful for covered criteria
- Traceability: weak — key SC-25 not referenced, NFR-3/US-4/US-9 absent

## 2. Architecture Comparison

Not applicable for this test-only RED phase review. No architectural components were added or modified by T-13.

## 3. Findings

### RV-01: Missing coverage for acceptance criterion "Selection and capture states remain distinguishable without motion" [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **Related:** T-13 AC3, NFR-3, US-4, US-9, SC-11, SC-25
- **Description:** T-13 requires verifying that selection highlight and capture glow remain visually distinguishable when reduced-motion is active (no animation timing). No test in any of the three reviewed files asserts this property.
- **Expected:** At least one unit test or E2E scenario verifies that under reduced-motion conditions, a selected card's visual state is distinct from a captured card's visual state — either by asserting different CSS classes, different computed styles, or different ARIA states that convey the distinction.
- **Actual:** No such test exists. The T-11 reduced-motion tests verify that animation metadata is suppressed, but none verify that the resulting static visual states remain distinguishable from each other.
- **Recommendation:** Add a unit test that activates reduced-motion, places one card in selected state and another in capture state simultaneously, and asserts that the applied CSS classes or visual attributes differ. Consider an E2E scenario in game-table-accessibility.feature that verifies this under reduced-motion media query override.
- **Impact:** Without this test, a regression that makes selection and capture visually identical under reduced-motion would go undetected, violating NFR-3, US-4 ("selection highlight is distinguishable from capture glow"), and SC-11.

### RV-02: SC-25 from card-animations BDD not referenced in T-13 tests [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** SC-25, NFR-2, US-4, US-14, T-13
- **Description:** The card-animations BDD document defines SC-25 ("Keyboard focus and navigation remain intact during animation") as the primary non-functional scenario for NFR-2 mapped to US-4 and US-14. None of the T-13 unit tests reference SC-25 in their titles or comments.
- **Expected:** T-13 tests should reference SC-25 for keyboard/focus stability during animation, since that is the canonical scenario from the feature's own BDD spec.
- **Actual:** Tests reference SC-20 and SC-23, which are scenario IDs from the game-table-accessibility.feature (belonging to the game-table-mvp spec, not card-animations). The game-table-accessibility.feature also reuses these IDs for its animation-load variants, creating a naming collision.
- **Recommendation:** Update unit test titles to reference SC-25 alongside or instead of SC-20/SC-23 to maintain clean traceability to the card-animations BDD. Consider disambiguating the SC-ID collision in game-table-accessibility.feature.
- **Impact:** Auditors tracing SC-25 coverage from bdd-test.md will not find it implemented, creating an apparent gap in the traceability matrix.

### RV-03: US-4, US-9, and NFR-3 not directly referenced by T-13 RED tests [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** US-4, US-9, NFR-3, T-13
- **Description:** T-13 spec traceability declares NFR-2, NFR-3, US-4, US-9, and US-14. The T-13 unit tests only reference NFR-2. NFR-3, US-4, US-9, and US-14 appear nowhere in T-13 test titles.
- **Expected:** Each traceable requirement should appear in at least one T-13 test title or comment header to maintain the test-to-requirement audit trail.
- **Actual:** Only NFR-2 is referenced. US-4's acceptance criterion about distinguishability and US-9's requirement for reduced-motion-safe behaviour are particularly relevant to T-13 AC3 but have no test referencing them.
- **Recommendation:** When the missing AC3 test (RV-01) is added, include US-4, US-9, and NFR-3 in its title. Additionally consider adding US-14 to an existing test since US-14 explicitly requires "tests verify that animations do not block keyboard navigation."
- **Impact:** Traceability audit will flag these requirements as unverified by T-13 specifically, even though adjacent tasks (T-11) partially cover them.

### RV-04: E2E focus-visible assertion limited to single element [Minor]

- **Category:** Test Quality
- **Severity:** Minor
- **Related:** NFR-2, SC-25, T-13 AC2
- **Description:** The E2E step definition for "focused controls remain visibly focusable during animation load" only verifies `:focus-visible` on the confirm-turn button. No hand card or table card is checked for focus visibility during animation.
- **Expected:** Since NFR-2 requires "focus outlines remain visible and unobstructed by animation effects" globally, at least one card element (which may have animation CSS classes applied) should also be verified for `:focus-visible`.
- **Actual:** Only confirm-turn is checked. Animation CSS classes are applied to card elements (not action buttons), so the cards are the elements most at risk of focus indicator occlusion by animation effects.
- **Recommendation:** Extend the Then step to also focus a hand card and verify `:focus-visible` matches, since cards are the elements receiving animation classes.
- **Impact:** A regression where animation glow/transform effects suppress focus visibility on cards specifically would not be detected by this E2E scenario.

### RV-05: E2E animation-load timing has no explicit animation-active guard [Note]

- **Category:** Test Quality
- **Severity:** Note
- **Related:** T-13, SC-25
- **Description:** The E2E "When action animations are active during turn sequencing" step triggers a play submission and waits for the awaiting-confirmation phase, but does not explicitly assert that animation CSS classes are present on card elements before proceeding to Then steps.
- **Expected:** For a test that is specifically about behaviour "during animation," there should be a guard assertion confirming animation is actually active at the time of the subsequent checks.
- **Actual:** The step relies on the assumption that Cypress's serial execution means animation classes are still present. This is likely correct given animation durations (800-1200ms) versus Cypress step execution time, but the test does not prove its own precondition.
- **Recommendation:** Consider adding a brief assertion within the When step that at least one card element carries an animation-related CSS class or data attribute, making the test self-documenting about its precondition.
- **Impact:** Low. Cypress's sequential model makes this unlikely to be flaky, but the test's intent would be clearer with an explicit precondition check.

### RV-06: Scenario ID collision between game-table-accessibility.feature and card-animations bdd-test.md [Note]

- **Category:** Test Coverage
- **Severity:** Note
- **Related:** SC-20, SC-21, SC-25, T-13
- **Description:** The game-table-accessibility.feature file reuses SC-20 and SC-21 IDs for its baseline accessibility scenarios AND for the new T-13 animation-load variants. Meanwhile, the card-animations bdd-test.md defines SC-20 as "Animation state updates do not alter rule outcomes" and SC-21 as "Animation interruption preserves game consistency" — entirely different scenarios.
- **Expected:** Scenario IDs should be globally unique across all feature specs to prevent traceability confusion.
- **Actual:** SC-20 and SC-21 each refer to three different things depending on context (game-table-mvp baseline, card-animations state isolation, and animation-load accessibility). The new T-13 variants in game-table-accessibility.feature add to this collision.
- **Recommendation:** Assign unique IDs to the T-13 animation-load scenarios in game-table-accessibility.feature (e.g., SC-25a, SC-25b, or a new numbering range) to disambiguate. Alternatively, reference them clearly as "game-table-accessibility SC-20 variant" in test titles.
- **Impact:** Audit confusion only; no runtime impact. However, this makes automated traceability tooling unreliable.

## 4. Traceability Matrix

| Finding | Severity | Category      | Related Spec                              | Status |
| ------- | -------- | ------------- | ----------------------------------------- | ------ |
| RV-01   | Major    | Test Coverage | T-13 AC3, NFR-3, US-4, US-9, SC-11, SC-25 | Open   |
| RV-02   | Minor    | Test Coverage | SC-25, NFR-2, US-4, US-14                 | Open   |
| RV-03   | Minor    | Test Coverage | US-4, US-9, NFR-3, US-14, T-13            | Open   |
| RV-04   | Minor    | Test Quality  | NFR-2, SC-25, T-13 AC2                    | Open   |
| RV-05   | Note     | Test Quality  | T-13, SC-25                               | Open   |
| RV-06   | Note     | Test Coverage | SC-20, SC-21, SC-25                       | Open   |

## 5. T-13 Acceptance Criteria Coverage

| Criterion                                                          | Status     | Notes                                                                                                          |
| ------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Keyboard navigation remains stable during all action animations    | ✅ Met     | Unit tests verify aria-disabled + focusability; E2E verifies keyboard operability during animation load        |
| Focus indicators remain visible and unobscured                     | ⚠️ Partial | E2E checks :focus-visible but only on action button, not on card elements that carry animation classes (RV-04) |
| Selection and capture states remain distinguishable without motion | ❌ Not Met | No test in any reviewed file addresses this criterion (RV-01)                                                  |

## 6. Spec Compliance Summary (T-13 scope)

| Requirement | Status     | Notes                                                                                       |
| ----------- | ---------- | ------------------------------------------------------------------------------------------- |
| NFR-2       | ⚠️ Partial | Keyboard stability tested; focus visibility only partially verified on cards                |
| NFR-3       | ❌ Not Met | No T-13 test verifies distinguishability under reduced-motion conditions                    |
| US-4        | ❌ Not Met | "Selection highlight distinguishable from capture glow" not tested by T-13                  |
| US-9        | ⚠️ Partial | Reduced-motion tests exist in T-11 scope; T-13 does not add distinguishability verification |
| US-14       | ⚠️ Partial | E2E tests exist but traceability reference to US-14 is absent from T-13 test titles         |

## 7. Task Completion Summary

| Task | Title                                              | Status     | Findings                   |
| ---- | -------------------------------------------------- | ---------- | -------------------------- |
| T-13 | Verify accessibility behavior under animation load | ⚠️ Partial | RV-01, RV-02, RV-03, RV-04 |

## 8. Test Coverage Summary

| Scenario                       | Step Definitions                                                     | Meaningful | Findings |
| ------------------------------ | -------------------------------------------------------------------- | ---------- | -------- |
| SC-25                          | ❌ No (not referenced)                                               | N/A        | RV-02    |
| SC-20 (a11y animation variant) | ✅ Yes                                                               | ✅ Yes     | —        |
| SC-21 (a11y animation variant) | ✅ Yes                                                               | ⚠️ Partial | RV-04    |
| SC-11                          | ❌ No (distinguishability not tested under animation/reduced-motion) | N/A        | RV-01    |

## 9. Test Quality Summary

| Test File                                             | Type      | Meaningful Assertions | Issues                                                                                               |
| ----------------------------------------------------- | --------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| game-table-page.deal-opponent.spec.ts (T-13 tests)    | Unit      | ✅ Yes                | None — assertions on aria-disabled and document.activeElement are meaningful                         |
| game-table-accessibility.feature (animation variants) | E2E       | ⚠️ Partial            | Focus-visible checked on single element only (RV-04); no animation-active precondition guard (RV-05) |
| game-table.ts (animation-load steps)                  | E2E Steps | ⚠️ Partial            | animationLoadFocusTargetBefore length check is weak but acceptable as precondition                   |

## 10. Security Cross-Reference

T-13 is a pure accessibility verification task with no new services, data handling, external inputs, or state mutations. No security-relevant surface area is introduced. No security findings apply.

## 11. Recommendations

### Major (fix before merge)

1. **Add a test for selection/capture distinguishability without motion** (RV-01): Write a unit test that enables reduced-motion, applies selection state to one card and capture state to another, and asserts the resulting visual attributes (CSS classes or computed styles) differ meaningfully.

### Minor (improvement)

2. **Reference SC-25 in T-13 test titles** (RV-02): Update the existing T-13 unit test titles to include SC-25 for card-animations BDD traceability.
3. **Add US-4, US-9, NFR-3 references** (RV-03): Include these requirement IDs in test titles when the AC3 test is written.
4. **Extend E2E focus-visible check to card elements** (RV-04): Verify `:focus-visible` on at least one hand-card element during animation load, not just action buttons.

### Notes (informational)

5. **Consider adding animation-active precondition assertion** (RV-05): Optional but improves test self-documentation.
6. **Disambiguate SC-ID collisions** (RV-06): Assign unique IDs to animation-load variants to avoid cross-spec confusion.
