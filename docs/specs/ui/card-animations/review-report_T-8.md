# Review Report: Card Animation System — T-8 Deal and Opponent Animation Flows (RED Phase Test Review)

**Review Mode:** Incremental (T-8: Implement deal and opponent animation flows — tests only)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** proposal.md, spec.md, user-stories.md, bdd-test.md, design.md, tasks.md

## 1. Executive Summary

The RED phase test suite for T-8 is well-structured, meaningful, and strongly aligned to spec requirements. All 8 unit tests assert real orchestration behavior (group creation, card identity, timing lifecycle, metadata propagation) rather than existence checks. The E2E Gherkin scenarios faithfully reproduce SC-07, SC-08, and SC-12 with DOM-level assertions on CSS classes, computed durations, and animation-delay uniformity. One minor coverage gap exists for the opponent-receives-cards path of FR-5 and US-5. No superficial or tautological tests were found.

- Total findings: 3 (0 Critical, 0 Major, 2 Minor, 1 Note)
- Spec compliance (testable in RED): 6 of 7 traceable requirements have test representation
- BDD scenario coverage: 3 of 3 in-scope scenarios fully represented
- Test quality: meaningful

## 2. Test File Summary

<<<<<<< Updated upstream
| File | Type | Tests | Scenarios Covered |
| ------------------------------------- | -------------------- | ----------- | ------------------- |
| game-table-page.deal-opponent.spec.ts | Unit/Integration | 8 | SC-07, SC-08, SC-12 |
| deal-opponent-animations.feature | E2E Gherkin | 3 scenarios | SC-07, SC-08, SC-12 |
| deal-opponent-animations.ts | E2E Step Definitions | 12 steps | SC-07, SC-08, SC-12 |
=======
| File | Type | Tests | Scenarios Covered |
|------|------|-------|-------------------|
| game-table-page.deal-opponent.spec.ts | Unit/Integration | 8 | SC-07, SC-08, SC-12 |
| deal-opponent-animations.feature | E2E Gherkin | 3 scenarios | SC-07, SC-08, SC-12 |
| deal-opponent-animations.ts | E2E Step Definitions | 12 steps | SC-07, SC-08, SC-12 |

> > > > > > > Stashed changes

## 3. Findings

### RV-01: Missing test for AI opponent receiving new cards {Minor}

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** FR-5, US-5, US-8
  <<<<<<< Updated upstream
- # **Description:** FR-5 specifies that when the AI opponent receives new cards (hand replenishment), a "subtle animation indicates cards being dealt." US-5 acceptance criteria item 2 states "When the AI opponent receives new cards (hand replenishment), a subtle animation indicates cards being dealt." The test suite covers AI _playing_ a card (opponent-play action type) but does not verify that a deal-to-opponent animation group is started when the AI hand is replenished.
- **Description:** FR-5 specifies that when the AI opponent receives new cards (hand replenishment), a "subtle animation indicates cards being dealt." US-5 acceptance criteria item 2 states "When the AI opponent receives new cards (hand replenishment), a subtle animation indicates cards being dealt." The test suite covers AI _playing_ a card (opponent-play action type) but does not verify that a deal-to-opponent animation group is started when the AI hand is replenished.
  > > > > > > > Stashed changes
- **Expected:** A unit test verifying that `startGroup` is called with an appropriate action type (possibly `deal` with opponent zone context, or a distinct sub-category) when the game state shows the AI hand gaining new cards after a round deal.
- **Actual:** All opponent-related tests exercise only the `opponent-play` action type. No test triggers a state transition where the AI's hand count increases and verifies animation metadata on OpponentZones with deal-style state.
- **Recommendation:** Add a unit test that simulates a deal state transition where `players[1].hand` grows (round start or hand replenishment) and asserts that animation metadata reaches OpponentZones with a deal or replenishment visual cue. The T-8 acceptance criterion "Opponent action visuals are clear and consistent with style system" is broad enough to include this.
- **Impact:** Without this test, the opponent-receive-cards animation path has no RED phase guard. Implementation could skip it without failing any test.

### RV-02: E2E SC-12 step relies on timing-sensitive AI animation window {Minor}

- **Category:** Test Quality
- **Severity:** Minor
- **Related:** SC-12, TR-4, AD-3
- **Description:** The E2E step definition for SC-12 ("it is the AI opponent turn in single-player mode") clicks the confirm button and then immediately looks for the AI animation within the AI hand zone. The animation window is brief, and the step comment acknowledges this: "capture the brief AI animation window." If test timing drifts (CI load, slower rendering), the assertion might miss the transient CSS class.
- **Expected:** Step definitions use deterministic synchronization (e.g., waiting for a data attribute indicating AI-resolving phase, or using the test override to extend the animation window).
- **Actual:** The step uses a visibility check on `selectors.aiHandZone` and an 8-second timeout for the animation class, which is generous but still fundamentally races against animation lifecycle.
- **Recommendation:** Consider asserting a deterministic marker (e.g., `data-ai-phase="resolving"` on the game table page) before checking for the animation class, or using `cy.intercept` style synchronization to decouple from real timing. Alternatively, the TurnPausePolicy test override (already set to 0 in unit tests) could be leveraged in E2E mode to hold the animation state longer for observation.
- **Impact:** Potential flaky E2E test on slow CI runners. Low risk given the 8-second timeout but worth hardening.

### RV-03: Card ID format convention established implicitly {Note}

- **Category:** Test Correctness
- **Severity:** Note
- **Related:** TR-1, AD-1
- **Description:** Unit test 7 asserts `cardIds` contains `'Oros-1'` for a card with suit `'Oros'` and rank `'1'`. This establishes a card identifier format convention of `{suit}-{rank}`. The existing `animation-contracts.ts` defines `cardIds: string[]` without specifying the format. The T-7 player-play tests should already define this convention; this test is consistent as long as the implementation uses the same format.
- **Expected:** Card ID format is documented or consistently derived from the same utility across all animation tests.
- **Actual:** The format is implicitly assumed. No shared utility or constant defines the ID derivation strategy in the test file.
- **Recommendation:** No action required for RED phase. During GREEN implementation, ensure the card-to-ID derivation is a single shared function so all tests and production code agree on the format.
- **Impact:** None in isolation. Potential inconsistency risk if other test files use a different format.

## 4. Traceability Matrix

<<<<<<< Updated upstream
| Finding | Severity | Category | Related Spec | Status |
| ------- | -------- | ---------------- | ----------------- | ------ |
| RV-01 | Minor | Test Coverage | FR-5, US-5, US-8 | Open |
| RV-02 | Minor | Test Quality | SC-12, TR-4, AD-3 | Open |
| RV-03 | Note | Test Correctness | TR-1, AD-1 | Open |

## 5. Spec Compliance Summary (Test Representation)

| Requirement | Test Exists | Notes                                                                       |
| ----------- | ----------- | --------------------------------------------------------------------------- |
| FR-3        | ✅ Yes      | Tests 1–4 verify deal group creation, simultaneity, metadata, and lifecycle |
| FR-5        | ⚠️ Partial  | AI play covered; AI receive-cards path not tested (RV-01)                   |
| FR-8        | ✅ Yes      | Tests 5–8 verify opponent-play group, timing, card ID, metadata propagation |
| TR-2        | ✅ Yes      | E2E steps verify CSS animation classes and computed duration values         |
| TR-5        | ⚠️ Partial  | Not directly tested here; coordinate pathing is T-14 responsibility         |
| US-3        | ✅ Yes      | Deal tests verify hand receives cards with animation orchestration          |
| US-5        | ⚠️ Partial  | AI play path tested; AI hand replenishment animation not tested (RV-01)     |
| US-8        | ✅ Yes      | AI turn animation coordination and timing envelope verified                 |

## 6. BDD Scenario Coverage

| Scenario | Unit Test           | E2E Feature | E2E Steps   | Meaningful |
| -------- | ------------------- | ----------- | ----------- | ---------- |
| SC-07    | ✅ Tests 1, 4       | ✅ Present  | ✅ Complete | ✅ Yes     |
| SC-08    | ✅ Tests 2, 3       | ✅ Present  | ✅ Complete | ✅ Yes     |
| SC-12    | ✅ Tests 5, 6, 7, 8 | ✅ Present  | ✅ Complete | ✅ Yes     |

## 7. Test Quality Assessment

| Test                                        | Assertion Type                                      | Meaningful | Issues                     |
| ------------------------------------------- | --------------------------------------------------- | ---------- | -------------------------- |
| Unit 1: starts deal group after confirm     | Spy call verification + actionType match            | ✅ Yes     | None                       |
| Unit 2: deal group includes 3 cards         | cardIds.length equality                             | ✅ Yes     | None                       |
| Unit 3: deal class on all hand cards        | Animation metadata state check                      | ✅ Yes     | None                       |
| Unit 4: deal state cleared after completion | Lifecycle status filter                             | ✅ Yes     | None                       |
| Unit 5: opponent-play group on AI play      | Spy call verification + actionType match            | ✅ Yes     | None                       |
| Unit 6: opponent-play duration 800–1200ms   | Group finalization after time advance               | ✅ Yes     | None                       |
| Unit 7: opponent-play includes AI card ID   | cardIds containment check                           | ✅ Yes     | None                       |
| Unit 8: metadata reflected on OpponentZones | Zone instance metadata inspection                   | ✅ Yes     | None                       |
| E2E SC-07 steps                             | CSS class presence + interactability                | ✅ Yes     | None                       |
| E2E SC-08 steps                             | Class count + animation-delay uniformity            | ✅ Yes     | None                       |
| E2E SC-12 steps                             | CSS class, computed duration range, timing-function | ✅ Yes     | Timing sensitivity (RV-02) |

## 8. Acceptance Criteria Verification

| T-8 Acceptance Criterion                                       | Covered     | Test(s)                                      |
| -------------------------------------------------------------- | ----------- | -------------------------------------------- |
| Deal animations enter hand simultaneously                      | ✅ Yes      | Unit 2, 3; E2E SC-08                         |
| Opponent action visuals clear and consistent with style system | ✅ Yes      | Unit 5–8; E2E SC-12                          |
| Opponent scope remains single-player AI only                   | ✅ Implicit | Session config is 'Single Player' throughout |

=======
| Finding | Severity | Category | Related Spec | Status |
|---------|----------|----------|-------------|--------|
| RV-01 | Minor | Test Coverage | FR-5, US-5, US-8 | Open |
| RV-02 | Minor | Test Quality | SC-12, TR-4, AD-3 | Open |
| RV-03 | Note | Test Correctness | TR-1, AD-1 | Open |

## 5. Spec Compliance Summary (Test Representation)

| Requirement | Test Exists | Notes                                                                       |
| ----------- | ----------- | --------------------------------------------------------------------------- |
| FR-3        | ✅ Yes      | Tests 1–4 verify deal group creation, simultaneity, metadata, and lifecycle |
| FR-5        | ⚠️ Partial  | AI play covered; AI receive-cards path not tested (RV-01)                   |
| FR-8        | ✅ Yes      | Tests 5–8 verify opponent-play group, timing, card ID, metadata propagation |
| TR-2        | ✅ Yes      | E2E steps verify CSS animation classes and computed duration values         |
| TR-5        | ⚠️ Partial  | Not directly tested here; coordinate pathing is T-14 responsibility         |
| US-3        | ✅ Yes      | Deal tests verify hand receives cards with animation orchestration          |
| US-5        | ⚠️ Partial  | AI play path tested; AI hand replenishment animation not tested (RV-01)     |
| US-8        | ✅ Yes      | AI turn animation coordination and timing envelope verified                 |

## 6. BDD Scenario Coverage

| Scenario | Unit Test           | E2E Feature | E2E Steps   | Meaningful |
| -------- | ------------------- | ----------- | ----------- | ---------- |
| SC-07    | ✅ Tests 1, 4       | ✅ Present  | ✅ Complete | ✅ Yes     |
| SC-08    | ✅ Tests 2, 3       | ✅ Present  | ✅ Complete | ✅ Yes     |
| SC-12    | ✅ Tests 5, 6, 7, 8 | ✅ Present  | ✅ Complete | ✅ Yes     |

## 7. Test Quality Assessment

| Test                                        | Assertion Type                                      | Meaningful | Issues                     |
| ------------------------------------------- | --------------------------------------------------- | ---------- | -------------------------- |
| Unit 1: starts deal group after confirm     | Spy call verification + actionType match            | ✅ Yes     | None                       |
| Unit 2: deal group includes 3 cards         | cardIds.length equality                             | ✅ Yes     | None                       |
| Unit 3: deal class on all hand cards        | Animation metadata state check                      | ✅ Yes     | None                       |
| Unit 4: deal state cleared after completion | Lifecycle status filter                             | ✅ Yes     | None                       |
| Unit 5: opponent-play group on AI play      | Spy call verification + actionType match            | ✅ Yes     | None                       |
| Unit 6: opponent-play duration 800–1200ms   | Group finalization after time advance               | ✅ Yes     | None                       |
| Unit 7: opponent-play includes AI card ID   | cardIds containment check                           | ✅ Yes     | None                       |
| Unit 8: metadata reflected on OpponentZones | Zone instance metadata inspection                   | ✅ Yes     | None                       |
| E2E SC-07 steps                             | CSS class presence + interactability                | ✅ Yes     | None                       |
| E2E SC-08 steps                             | Class count + animation-delay uniformity            | ✅ Yes     | None                       |
| E2E SC-12 steps                             | CSS class, computed duration range, timing-function | ✅ Yes     | Timing sensitivity (RV-02) |

## 8. Acceptance Criteria Verification

| T-8 Acceptance Criterion                                       | Covered     | Test(s)                                      |
| -------------------------------------------------------------- | ----------- | -------------------------------------------- |
| Deal animations enter hand simultaneously                      | ✅ Yes      | Unit 2, 3; E2E SC-08                         |
| Opponent action visuals clear and consistent with style system | ✅ Yes      | Unit 5–8; E2E SC-12                          |
| Opponent scope remains single-player AI only                   | ✅ Implicit | Session config is 'Single Player' throughout |

> > > > > > > Stashed changes

## 9. Recommendations

### Minor (improvement before GREEN)

<<<<<<< Updated upstream

=======

> > > > > > > Stashed changes

1. **RV-01:** Add a unit test for AI opponent hand replenishment animation path to complete FR-5 and US-5 coverage.
2. **RV-02:** Add a deterministic synchronization marker for E2E SC-12 to reduce timing sensitivity.

### Notes (informational)

<<<<<<< Updated upstream

=======

> > > > > > > Stashed changes

1. **RV-03:** Card ID format is consistent with expected convention; no action needed now but keep derivation centralized during implementation.
