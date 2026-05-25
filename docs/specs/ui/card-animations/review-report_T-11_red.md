# Review Report: Card Animation System — T-11 Reduced-Motion Compatibility (RED Phase)

**Review Mode:** Incremental (T-11: Implement reduced-motion compatibility path) — Tests Only (RED)
**Source:** `docs/specs/ui/card-animations/`
**Scope:** Only newly added/updated tests in:

- `src/app/features/game-board/game-table-page/game-table-page.spec.ts`
- `src/app/features/game-board/game-table-page/game-table-page.deal-opponent.spec.ts`

## 1. Executive Summary

The RED-phase test suite for T-11 provides a **partial but solid foundation** for the reduced-motion compatibility path. Three well-constructed tests at lines 864, ~543, and ~578 meaningfully verify motion suppression and end-state preservation. However, the suite has two structural gaps (no opponent-play suppression test, no transition pause preservation test) and three misattributed tests (FR-9.x announcements labelled T-11 but testing unrelated behaviour against a non-existent requirement).

- Total findings: 5 (0 Critical, 2 Major, 2 Minor, 1 Note)
- Acceptance criteria coverage: 2 of 3 partially met, 1 not covered at unit level
- RED readiness: **Not fully ready for GREEN** — two gaps must be filled to guarantee GREEN implementation covers all acceptance criteria

## 2. T-11 Tests Identified

| #   | File                                  | Line | Title                                                                                   | Verdict          |
| --- | ------------------------------------- | ---- | --------------------------------------------------------------------------------------- | ---------------- |
| 1   | game-table-page.spec.ts               | 864  | Reduced-motion submit path suppresses play and capture motion classes                   | ✅ Meaningful    |
| 2   | game-table-page.deal-opponent.spec.ts | ~543 | Reduced-motion path suppresses deal animation metadata while preserving confirm outcome | ✅ Meaningful    |
| 3   | game-table-page.deal-opponent.spec.ts | ~578 | Reduced-motion path bypasses extended AI semantic pauses before decision                | ✅ Meaningful    |
| 4   | game-table-page.spec.ts               | 2684 | T-11 / FR-9.1 — announces AI placement through live region                              | ⚠️ Misattributed |
| 5   | game-table-page.spec.ts               | 2737 | T-11 / FR-9.2 — announces AI capture count without card identity                        | ⚠️ Misattributed |
| 6   | game-table-page.spec.ts               | 2789 | T-11 / FR-9.3 — announces escoba instead of generic capture                             | ⚠️ Misattributed |

## 3. Findings

### RV-01: Missing test for opponent-play animation suppression under reduced-motion [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **Related:** AC-1, SC-13, TR-6, NFR-3, US-9
- **Description:** The deal-opponent spec tests deal suppression and AI deliberation bypass under reduced-motion, but contains no test verifying that the `opponent-play` animation group is suppressed when `prefers-reduced-motion: reduce` is active.
- **Expected:** Per SC-13 ("AI visual updates occur instantly without motion") and AC-1 ("movement and timed effects are disabled"), a test should assert that no opponent-play animation group enters running state under reduced-motion — mirroring how the deal test at ~543 does for deal groups.
- **Actual:** Opponent-play tests exist for normal mode (SC-12 at lines ~355–475) but none mock `matchMedia` to verify reduced-motion suppression of the opponent-play animation group.
- **Recommendation:** Add a test that mocks reduced-motion, triggers an AI turn via `runAiTurnDirectly()`, and asserts zero running opponent-play groups while confirming the engine still calls `playCard` and `confirmTurn` (end-state preserved).
- **Impact:** GREEN implementation could omit the opponent-play suppression path without any test catching it.

### RV-02: Missing test for transition pause preservation under reduced-motion [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **Related:** AC-3, SC-19, FR-7, TR-6, US-9
- **Description:** No unit test in either file verifies that the post-animation transition pause (500–800ms) is still applied when reduced-motion is active.
- **Expected:** Per AC-3 ("transition pause behavior follows approved policy"), TR-6 ("Pause logic (FR-7) should still apply briefly for clarity, but animations are instant"), and US-9 ("A brief pause (500–800ms) is still applied between actions for clarity"), a test should assert that even with instant animations, the configured handoff pause is enforced before turn advancement.
- **Actual:** The AI deliberation bypass test at ~578 asserts that the decision happens quickly (within 20ms), but no test asserts that the post-play confirm still waits for the configured pause duration. SC-19 exists in E2E but there is no unit-level equivalent.
- **Recommendation:** Add a test that mocks reduced-motion, sets `TurnPausePolicy` to a non-zero override (e.g. 400ms), triggers a play action, and asserts `confirmTurnSpy` is NOT called before the pause elapses — then IS called after the pause completes.
- **Impact:** GREEN implementation could accidentally bypass transition pauses in reduced-motion mode without test failure, violating the "pause still applies" contract.

### RV-03: FR-9.x tests misattributed to T-11 with non-existent requirement IDs [Minor]

- **Category:** Test Quality (Traceability)
- **Severity:** Minor
- **Related:** T-11, T-13 (likely correct owner)
- **Description:** Three tests at lines 2684, 2737, and 2789 in game-table-page.spec.ts are labelled `T-11 / FR-9.1`, `T-11 / FR-9.2`, and `T-11 / FR-9.3`. However, FR-9 does not exist in spec.md (the highest functional requirement is FR-8). Additionally, these tests verify screen reader live region announcements during AI turns — behaviour unrelated to reduced-motion compatibility.
- **Expected:** Tests should reference requirements that exist in the spec and be attributed to the task whose acceptance criteria they verify. These announcements likely belong to T-13 (Accessibility verification) or a future accessibility-focused task.
- **Actual:** Tests are labelled T-11 but do not mock `matchMedia`, do not test reduced-motion behaviour, and reference FR-9.x which is undefined. They test announcement content (AI placement, capture count, escoba) in normal motion mode.
- **Recommendation:** Re-label these tests to their correct task (likely T-13) and replace FR-9.x references with actual spec requirements (possibly NFR-3 or a new accessibility-scoped requirement if announcements need formal spec coverage).
- **Impact:** Creates confusion about T-11 scope and inflates apparent T-11 coverage. No functional impact on RED/GREEN cycle since the tests are independently valid for their actual behaviour.

### RV-04: End-state assertions verify only spy calls, not resulting game state [Minor]

- **Category:** Test Quality
- **Severity:** Minor
- **Related:** AC-2, TR-6, US-9
- **Description:** The tests verifying AC-2 ("end-state outcomes match normal mode") assert that engine spies were called (e.g., `playCardSpy` was called once, `confirmTurnSpy` was called once) but do not verify the resulting game state matches what a normal-mode play produces.
- **Expected:** Per US-9 ("Game logic and state management are unaffected; only visual animation timing changes"), the final state signal should be identical to what normal mode produces — same hand composition, same table state, same captured pile.
- **Actual:** Test at line 864 checks `playCardSpy` call count. Test at ~543 checks `confirmTurnSpy` call count. Neither reads the resulting state signal to confirm the same cards moved to the same places.
- **Recommendation:** After the engine call assertion, additionally read the state signal and compare key fields (player hand length, table composition) to the expected post-action values.
- **Impact:** A GREEN implementation could call the engine method but with corrupted arguments (wrong card, wrong capture subset) and the test would still pass. Low risk given current mock architecture, but adds false confidence.

### RV-05: Deliberation pause bypass test uses timing assertion that may be fragile [Note]

- **Category:** Test Quality
- **Severity:** Note
- **Related:** AC-1, TR-6
- **Description:** The test at ~578 advances fake timers by 20ms and asserts `decideSpy` was called. This relies on the assumption that the deliberation pause in normal mode exceeds 20ms. If the normal-mode deliberation pause were ever configured below 20ms, this test would pass trivially in both modes.
- **Expected:** A more robust assertion would verify that `decideSpy` is called immediately (within one microtask) or that the deliberation delay resolves to 0ms under reduced-motion, regardless of the normal-mode configuration.
- **Actual:** The test passes if `decide` is called at any point within 20ms, which is reasonable given the current 400–600ms deliberation range, but not structurally self-documenting.
- **Recommendation:** Consider asserting `decideSpy` call count immediately after one `await fixture.whenStable()` cycle with 0ms advance, or add a comment documenting the assumed normal-mode deliberation baseline.
- **Impact:** No immediate risk. Informational observation about test resilience to future configuration changes.

## 4. Acceptance Criteria Coverage Matrix

| Acceptance Criterion                           | Unit Test Coverage                                                        | Findings |
| ---------------------------------------------- | ------------------------------------------------------------------------- | -------- |
| AC-1: Movement and timed effects disabled      | ⚠️ Partial — play, capture, deal, AI pause covered; opponent-play MISSING | RV-01    |
| AC-2: End-state outcomes match normal mode     | ⚠️ Partial — engine calls verified; resulting state not compared          | RV-04    |
| AC-3: Transition pause follows approved policy | ❌ Not covered at unit level                                              | RV-02    |

## 5. BDD Scenario Unit Coverage

| Scenario                                         | Unit Test Present     | Notes                                                                        |
| ------------------------------------------------ | --------------------- | ---------------------------------------------------------------------------- |
| SC-03 (Play motion removed, outcome preserved)   | ✅ Yes (line 864)     | Verifies suppression + playCard call                                         |
| SC-06 (Capture fade timing removed)              | ✅ Partial (line 864) | Capture class absence checked, but "instant removal" not explicitly verified |
| SC-09 (Dealt cards appear instantly)             | ✅ Yes (~543)         | No running deal group + confirmTurn called                                   |
| SC-13 (AI motion removed, readability preserved) | ❌ Missing            | No opponent-play suppression test                                            |
| SC-19 (Transition pause still enforced)          | ❌ Missing            | No unit test for pause preservation                                          |

## 6. GREEN Readiness Verdict

**Not ready for GREEN.** Two gaps must be addressed:

1. **Add opponent-play suppression test** (RV-01) — without this, GREEN implementation of SC-13 has no unit-level specification to drive it.
2. **Add transition pause preservation test** (RV-02) — without this, GREEN implementation cannot verify the critical "pause still applies" contract at unit level.

### Recommended Priority

| Priority        | Action                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| 1 (Blocking)    | Write opponent-play reduced-motion suppression test in deal-opponent spec  |
| 2 (Blocking)    | Write transition pause preservation test (reduced-motion + non-zero pause) |
| 3 (Cleanup)     | Re-label FR-9.x tests to correct task/requirement                          |
| 4 (Improvement) | Strengthen end-state assertions with state signal comparison               |

Once items 1 and 2 are addressed, the RED suite will comprehensively specify all three T-11 acceptance criteria and be ready for GREEN implementation.
