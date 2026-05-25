# Review Report: Card Animation System — T-11 Reduced-Motion Compatibility (RED Phase v2)

**Review Mode:** Incremental (T-11: Implement reduced-motion compatibility path) — Tests Only (RED), follow-up
**Source:** `docs/specs/ui/card-animations/`
**Scope:** Only T-11-attributed tests in:

- `src/app/features/game-board/game-table-page/game-table-page.spec.ts`
- `src/app/features/game-board/game-table-page/game-table-page.deal-opponent.spec.ts`

## 1. Executive Summary

The RED-phase test suite for T-11 is now **GREEN-ready**. The two blocking Major gaps identified in the prior review (v1) — SC-13 opponent-play suppression and SC-19 transition pause preservation — are both resolved with well-structured, meaningful tests. Three Minor/Note observations remain from v1 but none block GREEN implementation.

- Total findings: 3 (0 Critical, 0 Major, 2 Minor, 1 Note)
- Acceptance criteria coverage: 3 of 3 met at unit level
- RED readiness: **Ready for GREEN**

## 2. Prior Gaps — Resolution Status

| Prior Finding                      | Status           | Resolution                                        |
| ---------------------------------- | ---------------- | ------------------------------------------------- |
| RV-01 (SC-13 opponent suppression) | ✅ Resolved      | New test at line 610 in deal-opponent spec        |
| RV-02 (SC-19 pause preservation)   | ✅ Resolved      | New test at line 743 in main spec                 |
| RV-03 (FR-9.x misattribution)      | ⚠️ Still present | Lines 2735, 2788, 2840 still labelled T-11/FR-9.x |
| RV-04 (end-state assertions)       | ⚠️ Still present | Spy-call assertions only, no state comparison     |
| RV-05 (timing fragility)           | ℹ️ Still present | 20ms advance assumption unchanged                 |

## 3. New Test Assessment

### SC-13 Test (deal-opponent.spec.ts, line 610)

**Title:** `T-11 / SC-13 / TR-6 - reduced-motion path suppresses opponent-play visual metadata during AI resolution`

**Verdict:** ✅ Meaningful

**Quality analysis:**

- Correctly mocks `matchMedia` with reduced-motion preference
- Arranges a full AI turn via `arrangeAiTurn()` and `runAiTurnDirectly()`
- Uses fake timers for deterministic timing control
- Asserts that OpponentZones receives no active opponent animation metadata (`animationState === 'opponent'` is false for all entries)
- Properly restores `matchMedia` and real timers in `finally` block
- Mirrors the structural pattern of the normal-mode opponent animation test (line ~487), which asserts `opponentAnimationActive === true` — creating a clear before/after contrast

**Relationship to SC-13 acceptance:** "AI visual updates occur instantly without motion" — verified by asserting zero opponent animation metadata on the presentation boundary. "The player can still clearly understand the AI action result" — implicitly covered by the test completing without error (the AI flow runs to completion), though no explicit readability assertion exists (acceptable at unit level).

### SC-19 Test (game-table-page.spec.ts, line 743)

**Title:** `T-11 / SC-19 / FR-7 - reduced-motion confirm flow still enforces transition pause after completion`

**Verdict:** ✅ Meaningful

**Quality analysis:**

- Correctly mocks `matchMedia` with reduced-motion preference
- Spies on `resolvePauseMs` and configures it to return 700ms
- Calls `confirmTurnWithSequencing('player-post-play-confirm', true)` — directly exercising the sequencing path
- Asserts `confirmTurnSpy` NOT called at 699ms — proving pause is enforced
- Asserts `confirmTurnSpy` IS called at 700ms — proving pause completes correctly
- Verifies `resolvePauseMs` was called with `{ reducedMotion: true }` — proving the reduced-motion flag propagates to the policy
- Properly restores `matchMedia` and real timers in `finally` block

**Relationship to SC-19 acceptance:** "The game still enforces a pause within 500 to 800ms" — verified by the 700ms configured return and the timing boundary assertions. "The next phase starts only after pause completion" — verified by the `confirmTurnSpy` call assertion after the full pause elapses.

## 4. Remaining Findings (Carried from v1)

### RV-03: FR-9.x tests misattributed to T-11 with non-existent requirement IDs [Minor]

- **Category:** Test Quality (Traceability)
- **Severity:** Minor
- **Related:** T-11, T-13 (likely correct owner)
- **Status:** Unchanged from v1. Lines 2735, 2788, 2840 still labelled `T-11 / FR-9.1`, `T-11 / FR-9.2`, `T-11 / FR-9.3`. These test screen-reader announcements during AI turns — unrelated to reduced-motion.
- **Impact:** No GREEN blocker. Cosmetic traceability issue.

### RV-04: End-state assertions verify only spy calls, not resulting game state [Minor]

- **Category:** Test Quality
- **Severity:** Minor
- **Related:** AC-2, TR-6, US-9
- **Status:** Unchanged from v1. Tests confirm engine methods were invoked but do not compare the resulting state signal to expected post-action values. The new SC-13 test also follows this pattern (no state assertion after AI turn).
- **Impact:** No GREEN blocker. Low risk given mock architecture preserves correct state transitions.

### RV-05: Deliberation pause bypass test uses timing assertion that may be fragile [Note]

- **Category:** Test Quality
- **Severity:** Note
- **Related:** AC-1, TR-6
- **Status:** Unchanged from v1. The test at line ~592 advances 20ms and asserts `decideSpy` was called. Relies on normal-mode deliberation exceeding 20ms.
- **Impact:** Informational only.

## 5. Acceptance Criteria Coverage Matrix (Updated)

| Acceptance Criterion                           | Unit Test Coverage                                                                                     | Status     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| AC-1: Movement and timed effects disabled      | ✅ Covered — play/capture (line 864), deal (line ~543), AI pause (line ~592), opponent-play (line 610) | Resolved   |
| AC-2: End-state outcomes match normal mode     | ⚠️ Covered via engine spy calls — no explicit state comparison                                         | Acceptable |
| AC-3: Transition pause follows approved policy | ✅ Covered — pause enforced with `reducedMotion: true` flag, timing boundary verified (line 743)       | Resolved   |

## 6. BDD Scenario Unit Coverage (Updated)

| Scenario                                         | Unit Test Present     | Status    |
| ------------------------------------------------ | --------------------- | --------- |
| SC-03 (Play motion removed, outcome preserved)   | ✅ Yes (line 864)     | Unchanged |
| SC-06 (Capture fade timing removed)              | ✅ Partial (line 864) | Unchanged |
| SC-09 (Dealt cards appear instantly)             | ✅ Yes (line ~543)    | Unchanged |
| SC-13 (AI motion removed, readability preserved) | ✅ Yes (line 610)     | **New**   |
| SC-19 (Transition pause still enforced)          | ✅ Yes (line 743)     | **New**   |

## 7. GREEN Readiness Verdict

**Ready for GREEN.** All three acceptance criteria have unit-level test coverage. Both previously blocking gaps (SC-13 and SC-19) are resolved with well-constructed, meaningful tests that will fail appropriately in RED and pass only when the correct behaviour is implemented.

### Remaining cleanup (non-blocking)

| Priority        | Action                                              | Severity |
| --------------- | --------------------------------------------------- | -------- |
| 1 (Cleanup)     | Re-label FR-9.x tests to correct task/requirement   | Minor    |
| 2 (Improvement) | Add state-signal comparison to end-state assertions | Minor    |
| 3 (Hardening)   | Document or tighten deliberation timing assumption  | Note     |

None of these block the GREEN phase.
