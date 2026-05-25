# Review Report: Card Animation System — T-16 (Post-Fix Re-Review)

**Review Mode:** Incremental (T-16: Align and execute E2E scenarios from BDD) — Re-review after RV-01, RV-02 fixes
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** proposal.md, spec.md, user-stories.md, bdd-test.md, design.md, tasks.md
**Previous report:** `review-report_T-16.md`

## 1. Executive Summary

This re-review evaluates the fixes applied to address the two Major findings (RV-01 and RV-02) from the original T-16 review. Both findings are now **Resolved**. The new E2E feature files and step definitions provide meaningful, non-superficial coverage for the previously missing reduced-motion dedicated paths (SC-03, SC-06, SC-09, SC-13) and animation state isolation scenarios (SC-20, SC-21).

- Total findings: 3 (0 Critical, 0 Major, 2 Minor, 1 Note)
- Previously Major findings resolved: 2 of 2
- Remaining open findings: RV-03 (Minor), RV-04 (Minor), RV-05 (Note) — unchanged from original review
- Test quality of new files: Meaningful — assertions verify animation class absence, game state stability, deep equality of engine summaries, DOM consistency, and recovery state

## 2. Resolved Findings

### RV-01: Reduced-motion play, capture, deal, and AI scenarios — RESOLVED

- **Previous severity:** Major
- **Status:** ✅ Resolved
- **Evidence:** New file `reduced-motion-dedicated.feature` provides four dedicated scenarios covering SC-03, SC-06, SC-09, and SC-13. The corresponding step definitions in `reduced-motion-dedicated.ts` implement meaningful assertions:
  - SC-03: Stubs `matchMedia` for reduced-motion preference, submits a non-capture play via keyboard, asserts play motion classes have zero instances in the DOM, and verifies table card count increased while hand count decreased.
  - SC-06: Under reduced-motion, dynamically identifies a legal capture combination using subset-sum analysis, submits the capture, asserts capture motion classes have zero instances, and verifies card count adjustments match expected capture outcome.
  - SC-09: Under reduced-motion, submits a play, confirms the turn to trigger deal phase, asserts deal motion classes have zero instances, and verifies hand cards remain available and interactive.
  - SC-13: Under reduced-motion, applies the AI-turn-capture fixture via the test API seam, asserts opponent motion classes have zero instances, and verifies AI outcome remains readable via visible UI elements and live region announcements.
- **Quality assessment:** All assertions verify both the negative condition (animation classes absent) and the positive outcome (correct game state progression). No superficial or tautological assertions. Proper use of reduced-motion stubbing via `matchMedia` override in `onBeforeLoad`. Error handling for missing test API.

### RV-02: Animation state isolation and interruption scenarios — RESOLVED

- **Previous severity:** Major
- **Status:** ✅ Resolved
- **Evidence:** New file `animation-state-isolation.feature` provides two dedicated scenarios covering SC-20 and SC-21. The corresponding step definitions in `animation-state-isolation.ts` implement meaningful assertions:
  - SC-20: Opens a game, applies an animation-heavy fixture via the test API, captures a baseline engine state summary (round number, table card count, hand card counts, round result presence, winner count, turn phase), waits 300ms to allow animation processing, re-reads the engine state summary, and performs a deep equality comparison proving animation did not alter engine state. Additionally verifies animation motion classes ARE present in the DOM, confirming animation was active while state remained stable.
  - SC-21: Applies a missing-completion fixture to trigger interruption recovery, reads the turn sequencing summary and verifies it reports a "recovered" state, verifies engine state remains in a legal turn phase (awaiting-card-play or awaiting-confirmation), and checks for no orphaned or duplicate card identities by comparing hand and table card data-testid attribute sets against their array lengths.
- **Quality assessment:** Deep equality verification of engine state summaries is a strong assertion pattern that validates AD-1 (animation is presentation-only). The uniqueness check on card identities via Set comparison directly addresses the "no orphaned visible card identities" requirement. No superficial assertions. Proper test API seam usage with typed interfaces.

## 3. Remaining Open Findings (Unchanged)

### RV-03: Selection feedback scenarios (SC-10, SC-11) not covered in card-animations E2E suite [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** SC-10, SC-11, FR-4, NFR-2, US-4, T-16
- **Status:** Open — not addressed in this fix cycle (selection feedback is a CSS transition, lower priority than core animation flows)

### RV-04: SC-24 identifier collision between game-table-mvp and card-animations specs [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** SC-24, TR-7, NFR-1, US-10, T-14, T-16
- **Status:** Open — traceability naming issue only, both tests remain meaningful

### RV-05: Non-functional quality gate scenarios SC-26 and SC-27 not represented in E2E [Note]

- **Category:** Test Coverage
- **Severity:** Note
- **Related:** SC-26, SC-27, NFR-5, NFR-6, US-13, US-14, T-16
- **Status:** Open — architecturally reasonable; these are process-level quality gates

## 4. Updated Traceability Matrix

| Finding | Severity  | Category      | Related Spec                                              | Status      |
| ------- | --------- | ------------- | --------------------------------------------------------- | ----------- |
| RV-01   | ~~Major~~ | Test Coverage | SC-03, SC-06, SC-09, SC-13, AD-5, TR-6, NFR-3, US-9, T-16 | ✅ Resolved |
| RV-02   | ~~Major~~ | Test Coverage | SC-20, SC-21, TR-1, TR-8, US-12, T-16                     | ✅ Resolved |
| RV-03   | Minor     | Test Coverage | SC-10, SC-11, FR-4, NFR-2, US-4, T-16                     | Open        |
| RV-04   | Minor     | Test Coverage | SC-24, TR-7, NFR-1, US-10, T-14, T-16                     | Open        |
| RV-05   | Note      | Test Coverage | SC-26, SC-27, NFR-5, NFR-6, US-13, US-14, T-16            | Open        |

## 5. Updated Spec Compliance Summary (Changes Only)

| Requirement | Previous Status | Updated Status | Notes                                                                                     |
| ----------- | --------------- | -------------- | ----------------------------------------------------------------------------------------- |
| TR-1        | ⚠️ Partial      | ✅ Met         | SC-20 now explicitly validates animation state isolation via engine summary deep equality |
| TR-6        | ⚠️ Partial      | ✅ Met         | SC-03, SC-06, SC-09, SC-13 now have dedicated reduced-motion E2E coverage                 |
| NFR-3       | ⚠️ Partial      | ✅ Met         | All core animation flows (play, capture, deal, AI) now validated under reduced-motion     |
| US-9        | ⚠️ Partial      | ✅ Met         | Reduced-motion fully covered across all action types                                      |
| US-12       | ⚠️ Partial      | ✅ Met         | Animation independence from game logic explicitly validated in SC-20, SC-21               |

## 6. Updated Test Coverage Summary (Changes Only)

| Scenario | Previous Status | Updated Status     | Notes                                                     |
| -------- | --------------- | ------------------ | --------------------------------------------------------- |
| SC-03    | ❌ No steps     | ✅ Yes, Meaningful | Verifies play motion class absence and placement outcome  |
| SC-06    | ❌ No steps     | ✅ Yes, Meaningful | Verifies capture motion class absence and state outcome   |
| SC-09    | ❌ No steps     | ✅ Yes, Meaningful | Verifies deal motion class absence and hand availability  |
| SC-13    | ❌ No steps     | ✅ Yes, Meaningful | Verifies opponent motion class absence and AI readability |
| SC-20    | ❌ No steps     | ✅ Yes, Meaningful | Verifies engine state deep equality during animation      |
| SC-21    | ❌ No steps     | ✅ Yes, Meaningful | Verifies recovery state and no orphaned card identities   |

## 7. Updated Test Quality Summary (New Files)

| Test File                         | Type        | Meaningful Assertions | Issues                                                                                               |
| --------------------------------- | ----------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| reduced-motion-dedicated.feature  | E2E Feature | ✅ Yes                | None                                                                                                 |
| reduced-motion-dedicated.ts       | E2E Steps   | ✅ Yes                | None — verifies animation class absence and game state outcomes under reduced-motion preference      |
| animation-state-isolation.feature | E2E Feature | ✅ Yes                | None                                                                                                 |
| animation-state-isolation.ts      | E2E Steps   | ✅ Yes                | None — verifies engine state stability via deep equality, interruption recovery, and DOM consistency |

## 8. Security Cross-Reference

No new security concerns introduced by the added test files. See `security-report_T-16.md` for the existing analysis (Medium finding on dev tooling dependencies only).

## 9. Updated Severity Summary

| Severity       | Original Count | Updated Count | Change             |
| -------------- | -------------- | ------------- | ------------------ |
| Critical       | 0              | 0             | —                  |
| Major          | 2              | **0**         | -2 (both resolved) |
| Minor          | 2              | 2             | unchanged          |
| Note           | 1              | 1             | unchanged          |
| **Total open** | **5**          | **3**         | **-2**             |

**No Critical or Major findings remain.** The T-16 task is clear for merge from a test coverage perspective. The remaining Minor and Note findings are acceptable for merge and can be addressed in a future improvement cycle.

## 10. Recommendations

### Critical (blocks release)

None.

### Major (fix before merge)

None.

### Minor (improvement, non-blocking)

1. **Resolve SC-24 identifier collision** between game-table-mvp and card-animations in game-table-responsive.feature (carried forward from original review).
2. **Consider lightweight selection feedback E2E (SC-10, SC-11)** to validate visual class distinction between selection and capture states (carried forward).

### Notes (informational)

1. SC-26 (browser compatibility) and SC-27 (maintainability) remain process-level quality gates validated outside the Cypress E2E suite (carried forward).
