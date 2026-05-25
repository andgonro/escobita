# Review Report: Card Animation System — T-12 Resilience and Cancellation (RED Phase Tests)

**Review Mode:** Incremental (T-12: Add resilience for cancellation and completion gaps) — RED test phase only
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** proposal.md, spec.md, user-stories.md, bdd-test.md, design.md, tasks.md
**Scope:** Unit tests in card-animation-orchestrator.spec.ts and game-table-page.deal-opponent.spec.ts

## 1. Executive Summary

The RED phase tests for T-12 provide meaningful coverage of all three acceptance criteria: deadlock prevention, cancellation cleanup, and orphaned-visual recovery. Tests use genuine behaviour assertions on state transitions, deterministic fake timers, and proper cleanup patterns. Traceability is clear with explicit FR/TR/US/SC references. Two minor structural concerns and a notable gap for a multi-group-failure scenario reduce confidence slightly.

- Total findings: 5 (0 Critical, 0 Major, 3 Minor, 2 Note)
- Acceptance criteria coverage: 3 of 3 addressed
- Test meaningfulness: All assertions verify behaviour, none are superficial
- Determinism: Strong (fake timers, proper cleanup, no flaky async patterns)
- Traceability: Good (file-level and per-test comment annotations)

## 2. Architecture Comparison

Not applicable for a test-only RED-phase review. No structural components were added or changed.

## 3. Findings

### RV-01: Missing test for partial-completion cancellation path [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** AD-2, T-12, TR-8, SC-21
- **Description:** The orchestrator spec tests cancelGroup on a group with zero participant completions. There is no test for cancelling a group where some participants have already reported completion while others remain pending.
- **Expected:** SC-21 specifies "animation is canceled or interrupted by a state change" — partial completion is the most realistic interruption scenario.
- **Actual:** Only the zero-completion cancellation path is tested in the orchestrator spec.
- **Recommendation:** Add a test that starts a multi-card group, completes one participant, then cancels the group, asserting the final state shows 'canceled' with mixed participant states and no side effects on completedGroupIds.
- **Impact:** Low risk — the zero-completion case likely exercises the same code path, but partial-completion edge cases could surface subtle state inconsistencies.

### RV-02: Misleading test name for "preserves canceled lifecycle" test [Minor]

- **Category:** Code Quality
- **Severity:** Minor
- **Related:** T-12, SC-21
- **Description:** The test named "preserves canceled lifecycle as a distinct contract state from normal completion flow" does not actually exercise cancellation. It completes a group normally and asserts status is 'completed' and is not 'canceled'.
- **Expected:** The test name suggests it verifies that cancellation produces a distinct status. The actual behaviour should demonstrate the _difference_ between a canceled group and a completed group.
- **Actual:** The test only asserts normal completion status, which is already covered by earlier tests. The distinction assertion (`not.toBe('canceled')`) adds minimal value beyond what the 'completed' equality check already establishes.
- **Recommendation:** Either rename the test to "completed groups do not carry canceled status" for clarity, or restructure it to create two groups — one completed, one canceled — and assert their statuses are distinct from each other.
- **Impact:** Readability and maintainability. A future developer may misunderstand the purpose of this test.

### RV-03: No re-entrant group start test after cancellation [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** AD-2, T-12, TR-8, US-12
- **Description:** No test verifies that starting a new animation group immediately after a cancellation produces a clean slate (fresh activeGroupId, no carryover from the canceled group's participant state).
- **Expected:** Design section 10 states "active groups are canceled and local animation state is reset" on teardown/phase change, implying new groups must work cleanly after cancellation.
- **Actual:** The orchestrator spec tests cancelGroup in isolation, and the GameTablePage spec tests teardown cancellation. Neither verifies the orchestrator can start fresh after cancellation.
- **Recommendation:** Add an orchestrator-level test: startGroup → cancelGroup → startGroup again → assert second group is tracked as expected with no residual state.
- **Impact:** Low — likely works correctly, but the re-entrant path is a common source of subtle bugs in state machines.

### RV-04: SC-21 integration test relies on magic timeout value [Note]

- **Category:** Code Quality
- **Severity:** Note
- **Related:** T-12, TR-8, SC-21
- **Description:** The "fallback completion clears transient visual cards after timeout recovery" test uses `advanceTimersByTimeAsync(1700)` which implicitly depends on the ANIMATION_COMPLETION_TIMEOUT_MS constant (1500ms) plus 200ms buffer. The relationship between these values is not documented in the test.
- **Expected:** The timeout constant should be referenced or annotated so future developers understand why 1700ms was chosen.
- **Actual:** The value appears as a magic number without explanation.
- **Recommendation:** Add a brief comment in the test explaining the timeout derivation, or extract the constant reference for self-documenting clarity.
- **Impact:** Informational only. The test is deterministic and correct, but may become brittle if the timeout constant changes.

### RV-05: Private method access via type assertions is consistent with project patterns [Note]

- **Category:** Code Quality
- **Severity:** Note
- **Related:** T-12, TR-8
- **Description:** Both spec files access private methods and state via `as unknown as { ... }` type assertions (cancelGroup in orchestrator, confirmTurnWithSequencing/transientPlayedHandCardState in GameTablePage). This pattern appears consistently throughout the project's test suite.
- **Expected:** In a strict testing philosophy, only public API boundaries would be tested.
- **Actual:** The pattern is established in this project and allows direct validation of internal resilience mechanisms that have no public observation path.
- **Recommendation:** No action required. The pattern is consistent with the project's existing test approach and the mechanisms being tested are internal by design.
- **Impact:** None. Noted for awareness only.

## 4. Traceability Matrix

| Finding | Severity | Category      | Related Spec            | Status |
| ------- | -------- | ------------- | ----------------------- | ------ |
| RV-01   | Minor    | Test Coverage | AD-2, T-12, TR-8, SC-21 | Open   |
| RV-02   | Minor    | Code Quality  | T-12, SC-21             | Open   |
| RV-03   | Minor    | Test Coverage | AD-2, T-12, TR-8, US-12 | Open   |
| RV-04   | Note     | Code Quality  | T-12, TR-8, SC-21       | Open   |
| RV-05   | Note     | Code Quality  | T-12, TR-8              | Open   |

## 5. Spec Compliance Summary (T-12 Scope)

| Requirement                              | Status | Notes                                                         |
| ---------------------------------------- | ------ | ------------------------------------------------------------- |
| TR-8 (Completion signals + cancellation) | ✅ Met | Timeout fallback, cancellation, and orphan cleanup all tested |
| US-12 (Animation state isolation)        | ✅ Met | Orchestrator state transitions verified in isolation          |
| US-14 (Reliable turn progression)        | ✅ Met | Deadlock prevention tested via SC-18 pattern                  |

## 6. Task Completion Summary

| Task | Title                                               | Status     | Findings            |
| ---- | --------------------------------------------------- | ---------- | ------------------- |
| T-12 | Add resilience for cancellation and completion gaps | ⚠️ Partial | RV-01, RV-02, RV-03 |

Partial because minor coverage gaps exist (partial-completion cancellation, re-entrant group start), but all three acceptance criteria have at least one meaningful test.

## 7. Test Coverage Summary

| Scenario | Step Definitions | Meaningful | Findings     |
| -------- | ---------------- | ---------- | ------------ |
| SC-18    | ✅ Yes           | ✅ Yes     | —            |
| SC-21    | ✅ Yes           | ✅ Yes     | RV-01, RV-03 |

## 8. Test Quality Summary

| Test File                             | Type        | Meaningful Assertions | Issues                       |
| ------------------------------------- | ----------- | --------------------- | ---------------------------- |
| card-animation-orchestrator.spec.ts   | Unit        | ✅ Yes                | Misleading test name (RV-02) |
| game-table-page.deal-opponent.spec.ts | Integration | ✅ Yes                | Magic timeout value (RV-04)  |

## 9. Security Cross-Reference

No security concerns identified for this test-only review. T-12 tests do not introduce inputs from untrusted sources, network calls, or persistence operations.

## 10. Recommendations

### Minor (improvement)

1. Add a partial-completion cancellation test to the orchestrator spec (addresses RV-01).
2. Rename or restructure the "preserves canceled lifecycle" test for clarity (addresses RV-02).
3. Add a re-entrant startGroup-after-cancel test to the orchestrator spec (addresses RV-03).

### Notes (informational)

1. Consider annotating the 1700ms timeout value with its derivation from ANIMATION_COMPLETION_TIMEOUT_MS (addresses RV-04).
2. The private-access testing pattern is project-consistent and requires no action (addresses RV-05).
