# Review Report: Card Animation System — T-6 Tests (RED Phase, Revision 2)

**Review Mode:** Incremental (T-6: Integrate completion-driven turn sequencing — tests only, post-revision)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** spec.md, bdd-test.md, design.md, tasks.md
**Prior report:** `review-report_T-6.md` (findings RV-01 through RV-05)

## 1. Executive Summary

This revision review validates whether prior findings RV-01 through RV-04 were addressed in the updated test files. Three of four actionable findings are fully resolved. The player flow lifecycle test now covers the complete animate → complete → pause → confirm path with precise timing assertions. SC-17 and SC-19 traceability tags are now present on unit tests. The SC-18 When-step duplication has been eliminated. RV-02 (E2E seam not registered) remains open as expected RED-phase behaviour. RV-05 (Note) is also resolved since the player-specific pause stage now exists.

- Total findings: 1 (0 Critical, 1 Major, 0 Minor, 0 Note)
- Prior findings resolved: 4 of 5 (RV-01, RV-03, RV-04, RV-05)
- Prior findings still open: 1 (RV-02 — expected RED-phase)
- Spec compliance: FR-7, TR-4, TR-8 now fully covered at unit level for both player and AI flows
- Test quality: meaningful — all three unit tests assert complete lifecycle behaviour with timing precision

## 2. Prior Finding Disposition

| Finding | Prior Severity | Status                 | Resolution                                                                                                                                                                                                                                                       |
| ------- | -------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RV-01   | Major          | ✅ Resolved            | New test at line 665 covers full lifecycle: startGroup → confirmTurn call → blocked assertion → finalizeGroup → timer advance below pause → still blocked → timer advance to meet pause → resolvePauseSpy verified with stage argument → confirmTurn called once |
| RV-02   | Major          | ⚠️ Open (expected RED) | Test seam methods still absent from application source; acceptable for RED phase                                                                                                                                                                                 |
| RV-03   | Minor          | ✅ Resolved            | Unit test names now include SC-17 and SC-19 traceability; SC-18 is intentionally E2E-only (timeout/fallback best validated in browser)                                                                                                                           |
| RV-04   | Minor          | ✅ Resolved            | SC-18 When-step no longer contains an assertion; it now executes a no-op read to represent the passage of time while fallback logic runs                                                                                                                         |
| RV-05   | Note           | ✅ Resolved            | Pause policy is now called with stage `'player-post-play-confirm'` in the player flow test, confirming the player-specific stage exists                                                                                                                          |

## 3. Remaining Findings

### RV-02 (carried): E2E test seam methods not yet registered in application bootstrap [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **Related:** T-6, SC-17, SC-18, SC-19, AD-3
- **Description:** The E2E step definitions call `readTurnSequencingSummary()` and `applyTurnSequencingFixture()` via the test API window object. These methods remain absent from the `EscobitaTestApi` interface in application source code.
- **Expected:** For RED phase, tests are written before implementation. The seam contract is well-defined in the E2E file (interface `TurnSequencingSummary` with four states plus pause and reduced-motion metadata; fixture names `'completed-animation'`, `'missing-completion'`, `'reduced-motion'`).
- **Actual:** No matching exports exist in `src/`. All three E2E scenarios will fail until the seam is wired during GREEN phase.
- **Recommendation:** During T-6 GREEN implementation, extend the `EscobitaTestApi` interface to include both methods. Ensure fixture state mutations are bounded and follow the dual-gate security pattern established by existing test seams.
- **Impact:** Expected RED-phase failure. All three E2E scenarios cannot pass until GREEN implementation wires the seam. Track as an explicit implementation dependency.

## 4. Test Quality Assessment

| Test File                                              | Type | Assertions                                                                                                                                                                          | Quality                                                        |
| ------------------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| game-table-page.spec.ts (T-6 blocking test, line 645)  | Unit | Asserts confirmTurn NOT called, resolvePauseMs NOT called while animation group is active                                                                                           | ✅ Meaningful — verifies blocking half of AD-2                 |
| game-table-page.spec.ts (T-6 lifecycle test, line 665) | Unit | Uses fake timers to verify exact pause boundary (24ms blocked, 25ms passes), asserts resolvePauseSpy called with correct stage and options, asserts confirmTurn called exactly once | ✅ Meaningful — full lifecycle with timing precision           |
| game-table-page.spec.ts (T-6 AI flow test, line 701)   | Unit | Verifies playCard called, confirmTurn NOT called after 2ms and 100ms while group active, confirmTurn called once after finalizeGroup + 1ms override                                 | ✅ Meaningful — validates AI path completion-driven sequencing |
| turn-sequencing-completion.ts (SC-17)                  | E2E  | Pause value within 500–800ms range, final state equals ready-to-confirm                                                                                                             | ✅ Meaningful — validates observable user-facing pause band    |
| turn-sequencing-completion.ts (SC-18)                  | E2E  | State not stuck at awaiting-animation-completion, recovers to 'recovered' state                                                                                                     | ✅ Meaningful — validates deadlock prevention                  |
| turn-sequencing-completion.ts (SC-19)                  | E2E  | Reduced-motion flag true, pause still enforced within 500–800ms, state reaches ready-to-confirm                                                                                     | ✅ Meaningful — validates reduced-motion does not bypass pause |

## 5. Spec Compliance Summary (T-6 scope)

| Requirement | Status     | Notes                                                                                                |
| ----------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| FR-7        | ✅ Met     | Both player and AI flows tested for completion-driven pause enforcement                              |
| TR-4        | ✅ Met     | Runtime override tested in AI flow; stage-resolved pause tested in player flow                       |
| TR-8        | ✅ Met     | Animation group finalization is the gate for turn confirmation in both paths                         |
| US-7        | ✅ Met     | E2E SC-17 validates the user-observable pause band; unit tests validate mechanism                    |
| US-14       | ⚠️ Partial | SC-18 defines fallback for missing completion; E2E step exists but seam not yet wired (expected RED) |

## 6. Traceability Matrix

| Finding | Severity | Category      | Related Spec                   | Status              |
| ------- | -------- | ------------- | ------------------------------ | ------------------- |
| RV-02   | Major    | Test Coverage | T-6, SC-17, SC-18, SC-19, AD-3 | Open (expected RED) |

## 7. Recommendations

### Major (track for GREEN phase)

1. Wire `readTurnSequencingSummary` and `applyTurnSequencingFixture` into the `EscobitaTestApi` interface during T-6 GREEN implementation. Follow the bounded fixture pattern established by existing seams.

### Resolved (no further action)

1. RV-01: Player lifecycle test now fully validates animate → complete → pause → confirm path.
2. RV-03: SC-17 and SC-19 traceability tags added to unit test names.
3. RV-04: SC-18 When-step no longer duplicates the Then-step assertion.
4. RV-05: Player-specific pause stage confirmed to exist.
