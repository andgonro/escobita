# Review Report: Game Engine Core — RED Phase Test Review

**Review Mode:** Incremental — T-12 through T-15 (test files only, RED phase)
**Source:** `docs/specs/game-engine/core/`
**Reviewed against:** spec.md, user-stories.md, bdd-test.md, design.md, tasks.md
**Date:** 2026-04-29
**Implementation status:** Implementation files do NOT exist. This review evaluates whether the test suite will adequately drive and verify the implementation once written.

---

## 1. Executive Summary

The four test files are well-structured overall and cover the majority of happy-path scenarios with meaningful assertions. The pure-function test files (deck utilities, scoring utilities, win-condition utilities) are generally solid, though two contain defects in their most important edge-case tests. The game engine service test file has more serious gaps: one test is structurally impossible to execute, several critical behavioral scenarios have no coverage at all, and two tests are conditionally hollow (they produce zero assertions in the scenarios they claim to verify).

**Total findings: 21 (1 Critical, 10 Major, 8 Minor, 2 Note)**

- Spec compliance: 71 of 85 BDD scenarios have at least partial test coverage. 14 scenarios (SC-31, SC-40, SC-41, SC-43, SC-46, SC-48, SC-49, SC-68 rejection path, SC-77 rejection path, SC-17 edge condition, SC-24 three-player path, SC-84 startNextRound step) have no meaningful coverage.
- Test quality: partially meaningful — the majority of assertions are correct and behavioral, but one dead test (SC-40 escoba detection) and two hollow conditional tests (SC-30, SC-68/SC-77) create false confidence in coverage that does not exist.
- Angular testing conventions: correct — pure function tests use no TestBed; the service test uses TestBed appropriately.

---

## 2. Architecture Comparison

Not applicable for this review. This is a RED phase review of test files only. No implementation files exist. Architecture conformance will be reviewed once implementation is complete.

---

## 3. Findings

### RV-01: SC-40 escoba detection test can never execute — dead test [Critical]

- **Category:** Test Quality
- **Severity:** Critical
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-40 — capture that clears the table records one escoba`
- **Related:** FR-5.4, US-4, SC-40, SC-41, T-15
- **Description:** The test searches for a game state where the table has exactly one card after `initGame` is called. However, `initGame` is specified by FR-2.2 to always deal exactly four cards to the table. This condition (`state.table.length === 1`) can never be true immediately after `initGame`. After 50 loop iterations, the `if (!found) { return; }` guard always fires and the test exits with zero assertions. Vitest reports it as passing. Escoba detection — a core scoring mechanic — has no functional test coverage whatsoever.
- **Expected:** A test that engineers a state where the table has exactly one card remaining (e.g., by playing down the table through prior captures to reduce it to one card) and then verifies that a capture clearing it increments `escobaCount` by 1. Alternatively, the test can set up a controlled multi-card scenario where all remaining table cards are captured in one play.
- **Actual:** The test relies on `initGame` producing a one-card table, which is architecturally impossible. Every run silently returns without assertion.
- **Recommendation:** Re-engineer the test to use `confirmTurn`-driven state progression to consume table cards through legitimate captures until only one remains, then verify the escoba trigger. Alternatively, the test should leverage the engine's two-phase model to play one card that, combined with a single remaining table card, sums to 15.
- **Impact:** FR-5.4, FR-7.3 (no-escoba-on-table-award), and US-4 have zero verified behavior. An implementation that never increments `escobaCount`, or that increments it incorrectly, would pass the entire test suite undetected.

---

### RV-02: SC-07 card immutability test is tautological [Major]

- **Category:** Test Quality
- **Severity:** Major
- **File:** `src/app/core/utils/deck.utils.spec.ts`
- **Test:** `SC-07 — a card's suit, rank, and numeric value do not change after it is created`
- **Related:** FR-1.5, SC-07, T-12
- **Description:** The test reads a card's `suit`, `rank`, and `value` into local variables, performs no operation between reading and asserting, then asserts that the card's properties still equal those same local variables. Because nothing happens between the read and the assertion, the test is logically equivalent to `expect(x).toBe(x)`. The comment "The card object itself should not change during gameplay (structural immutability guarantee)" confirms the intent but the test body does not exercise any gameplay scenario — it just reads a property twice in succession.
- **Expected:** A test that either (a) verifies the card object is frozen via `Object.isFrozen`, (b) attempts a mutation in a context where it would throw (strict mode property assignment to a frozen object), or (c) confirms the TypeScript `readonly` contract is in place via a compile-time type assertion. Without an actual mutation attempt or structural check, the test provides zero evidence of immutability.
- **Actual:** The assertions are trivially true by construction. An implementation with fully mutable card objects would pass this test identically.
- **Impact:** FR-1.5 — "a card is an immutable value" — has no real test coverage. If the implementation produces mutable card objects, nothing in the suite will catch mutations that corrupt game state.

---

### RV-03: SC-05 shuffle randomness test has an assertion logic error [Major]

- **Category:** Test Correctness
- **Severity:** Major
- **File:** `src/app/core/utils/deck.utils.spec.ts`
- **Test:** `SC-05 — two shuffles of the same deck produce different orderings (probabilistic)`
- **Related:** FR-1.4, TR-2.3, SC-05, T-12
- **Description:** The test generates two shuffled decks (`s1` and `s2`) from the same input, but the final assertion only checks that `s1` differs from the original unshuffled deck order. The variable `s2` is created and then never used in any assertion. The test description claims to verify that two shuffles of the same deck produce different orderings, but the assertion only verifies that one shuffle is not the identity permutation.
- **Expected:** The assertion should compare `s1` against `s2` to establish that repeated calls produce varying output. Alternatively, comparing both against the original deck order (ensuring neither is identity) is acceptable, but `s2` must appear in at least one assertion.
- **Actual:** `s2` is unused dead code. The test only validates that `shuffleDeck` is not the identity function — not that it actually randomises output with entropy. An implementation that always returns a fixed non-identity permutation (e.g., reversal) would pass this test.
- **Impact:** The randomness guarantee required by FR-1.4 and TR-2.3 is not meaningfully verified. A deterministic shuffle would go undetected.

---

### RV-04: SC-30 invalid-capture rejection test is non-deterministic [Major]

- **Category:** Test Reliability
- **Severity:** Major
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-30 — capture subset whose sum + played card ≠ 15 is rejected`
- **Related:** FR-5.6, TR-4.6, SC-30, T-15
- **Description:** The test picks the first hand card and first table card from a randomly-dealt game and checks whether their values sum to 15. If the sum happens to be 15 (a valid capture), the `else` branch executes and the test verifies a successful capture instead of a rejection. Because the deck is shuffled randomly, this condition occurs with non-trivial probability across repeated runs. The test silently changes its behavioral intent depending on the random deal — sometimes testing rejection (the scenario's purpose) and sometimes testing a valid capture (the opposite of the scenario's purpose).
- **Expected:** A test with a controlled setup that guarantees the played card and table card values cannot sum to 15. This requires either constructing the game state manually or selecting card combinations where no valid 15-sum is possible. The comment "if the sum happens to be 15; this scenario can't test rejection — skip" is an acknowledgement that the test design is flawed, not a valid mitigation.
- **Actual:** The test is non-deterministic. On any run where a 15-sum pair happens to appear, the rejection path is not exercised.
- **Impact:** FR-5.6 validation (rejecting invalid capture subsets) may be untested on a given run. An implementation that incorrectly accepts any subset regardless of sum would pass on those runs.

---

### RV-05: SC-31 — multiple valid capture subsets not tested at all [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Related:** FR-5.2, US-3, SC-31, T-15
- **Description:** No test covers the scenario where multiple valid capture subsets exist simultaneously on the table (e.g., a card with value 8 played against a table containing a 7, a 2, and a 5 — where both the single card of value 7 and the pair of 2+5 are each valid capture subsets). FR-5.2 is explicit that the player's explicit choice determines what is captured and that other valid subsets remain on the table. This is a distinguishing rule of La Escoba that has no coverage.
- **Expected:** A test that sets up a state with two or more simultaneously valid capture subsets, plays the card specifying one subset, and then verifies that only the specified subset was removed from the table and the other cards in the alternate valid subset remain.
- **Actual:** No such test exists. The only capture test (SC-28/SC-29) tests a single valid subset with no alternatives on the table.
- **Impact:** An implementation that captures all valid subsets (or selects the wrong subset) would go undetected. This is a fundamental rule of Escoba de 15.

---

### RV-06: SC-41 — multiple escoba accumulation not tested [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Related:** FR-5.4, US-4, SC-41, T-15
- **Description:** No test verifies that a player's `escobaCount` can exceed 1 within the same round. The only escoba test (SC-40) is the dead test described in RV-01 and can never execute. SC-41 specifically requires verifying that a second escoba increments the count from 1 to 2. Without any functional escoba test, accumulation behavior is entirely unverified.
- **Expected:** A test that arranges for the active player to make two successive escoba captures in the same round and asserts that `escobaCount` reaches 2.
- **Actual:** No test exists. SC-40 is dead (see RV-01) and SC-41 has no corresponding test.
- **Impact:** An implementation that resets `escobaCount` to 1 instead of incrementing it would pass the entire test suite undetected.

---

### RV-07: SC-43 and SC-49 — no escoba on end-of-round table card award not tested [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Related:** FR-7.3, US-7, SC-43, SC-49, T-15
- **Description:** No test verifies that when the engine awards remaining table cards to the last capturer at round end (FR-7.2), it does NOT increment that player's `escobaCount`. FR-7.3 is explicit: "Awarding remaining table cards at round end does NOT count as an escoba, regardless of how many cards are on the table." The `exhaustRound` helper plays all cards as table placements (no captures), so end-of-round table card award behavior follows the null-lastCapturer fallback path, and even that path's escoba-suppression guarantee is never checked.
- **Expected:** A test that runs a round with at least one capture (to set `lastCapturerId`), reaches end-of-round with cards remaining on the table, and asserts that the last capturer's `escobaCount` is not incremented during the award.
- **Actual:** No test exists for this behavior.
- **Impact:** An implementation that incorrectly records an escoba when awarding remaining table cards would pass the entire suite and inflate scores.

---

### RV-08: SC-46 — partial deal when deck is short not tested [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Related:** FR-6.3, US-6, SC-46, T-15
- **Description:** No test covers the edge case where all hands become empty during a deal triggered by `confirmTurn`, but the deck has fewer cards than 3 × the number of players. FR-6.3 specifies that in this case the remaining cards must be distributed starting from the player first in turn order, with some players receiving fewer than 3 cards. This is an important boundary condition for the dealing algorithm.
- **Expected:** A test that engineers a state where fewer than 6 cards remain in the deck (for a 2-player game) when all hands become empty, then verifies that the first player receives the expected number of cards and the second player receives the remainder.
- **Actual:** No such test exists. The auto-deal test (SC-44/SC-45) only verifies the normal 3-card-per-player path.
- **Impact:** An implementation that fails silently or distributes cards incorrectly when the deck is short would pass the suite.

---

### RV-09: SC-48 — table cards awarded to last capturer not directly tested [Major]

- **Category:** Test Coverage
- **Severity:** Major
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Related:** FR-7.2, US-7, SC-48, T-15
- **Description:** The `exhaustRound` helper always plays all cards with empty capture subsets (no captures are ever made). As a result, `lastCapturerId` is always null at round end. The `confirmTurn` end-of-round path only ever exercises the fallback behavior (null lastCapturer → last player in turn order). The primary FR-7.2 path — where a specific player made a capture and that identified player receives the remaining table cards — is never exercised. Additionally, no test asserts which player received the table cards in the captured pile.
- **Expected:** A test that makes at least one capture during the round (recording a non-null `lastCapturerId`), exhausts the deck, and verifies that the remaining table cards appear in the correct player's `capturedPile` and not in any other player's pile.
- **Actual:** The round-end tests rely exclusively on `exhaustRound`, which never makes captures.
- **Impact:** An implementation that always awards table cards to the last player in order (ignoring `lastCapturerId`) would pass the suite. FR-7.2 is untested for its primary case.

---

### RV-10: SC-68/SC-77 rejection test never asserts the rejection case [Major]

- **Category:** Test Quality
- **Severity:** Major
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-68/SC-77 — startNextRound is rejected when match winner already exists`
- **Related:** FR-9.5, US-9, US-10, SC-68, SC-77, T-15
- **Description:** The test is entirely conditional on `engine.matchWinner()` being null. When it is null (no winner after one exhausted round), the test verifies the success path (round number increments). When `matchWinner()` is non-null (a winner was declared), the test's `if` block does not execute and zero assertions fire — the test passes vacuously. The rejection case, which is the sole stated purpose of this scenario, is never reached in practice because a single exhausted round is extremely unlikely to reach 15 match points.
- **Expected:** A test that deliberately constructs a state where `matchWinner()` is non-null (e.g., by exhausting multiple rounds or by directly asserting that when the engine is in a winner state, `startNextRound()` leaves the state unchanged). The rejection path must be explicitly exercised with assertions confirming state is unchanged and a warning was logged.
- **Actual:** The rejection path has zero assertions.
- **Impact:** An implementation where `startNextRound` succeeds even when a match winner exists would pass this test unconditionally.

---

### RV-11: SC-51 RoundResult breakdown verified at structural level only [Major]

- **Category:** Test Quality
- **Severity:** Major
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-51 — RoundResult contains a per-player score breakdown`
- **Related:** FR-8.4, SC-51, SC-82, T-15
- **Description:** The test only checks that `result.playerScores` has length 2, that `playerId` is truthy, and that `total` is a number. No test checks the individual category fields (`escobas`, `mostCards`, `mostOros`, `mostSevens`, `sieteDiVelo`) or verifies that the `total` field matches the sum of its categories. Since `exhaustRound` makes no captures, scores are predictable (one player will win most-cards, possibly 2 points if all 40), but this is never asserted. The round result could return all zeros or random values for every category and this test would still pass.
- **Expected:** After `exhaustRound`, at least one player should have a non-zero `mostCards` score (since all 40 cards are distributed). The test should assert the winner's `mostCards` value is 1 or 2, verify `total` equals the sum of all category fields per player, and verify `roundNumber` matches the expected round.
- **Actual:** The test only asserts structural existence, not behavioral correctness.
- **Impact:** An implementation that populates `RoundResult` with all-zero scores would pass. FR-8.4 (detailed round result record) is not meaningfully verified.

---

### RV-12: SC-03 value assertions cover only the Oros suit [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **File:** `src/app/core/utils/deck.utils.spec.ts`
- **Tests:** `SC-03 — numbered ranks 1-7 carry their rank number as value`, `SC-03 — Sota carries value 8`, `SC-03 — Caballo carries value 9`, `SC-03 — Rey carries value 10`
- **Related:** FR-1.2, SC-03, T-12
- **Description:** All four SC-03 tests find cards by filtering for `suit === 'Oros'` only. The other 30 cards (Copas, Espadas, Bastos — 10 cards each) are never checked for correct value assignment. FR-1.2 applies to all cards, not just one suit. An implementation that assigns incorrect values to Copas, Espadas, or Bastos cards (while correctly handling Oros) would pass.
- **Expected:** Value assertions should verify at least a representative sample across all four suits. The test for Sota should find a Sota in each suit and check its value is 8 in all cases.
- **Actual:** Only Oros cards are checked.
- **Impact:** Minor gap — the sum-to-220 test (SC-04) provides a cross-suit sanity check, but individual value assignment errors that cancel out in the sum would still go undetected.

---

### RV-13: SC-26 scenario ID mislabeled in playCard suite [Minor]

- **Category:** Traceability
- **Severity:** Minor
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test (playCard suite):** `SC-26 — playCard while turnPhase is awaiting-confirmation is rejected`
- **Related:** FR-5.8, TR-4.6, SC-26
- **Description:** The BDD scenario SC-26 describes `confirmTurn` called while the engine is in the `awaiting-card-play` phase. The test labeled SC-26 in the `playCard` describe block tests a different behavior: `playCard` called while in the `awaiting-confirmation` phase. That behavior is a valid and correct test for FR-5.8 / TR-4.6, but it is not SC-26. The correct SC-26 is separately covered in the `confirmTurn` suite. This creates a duplicate SC-26 label across two suites and makes the BDD traceability matrix incorrect.
- **Expected:** The `playCard`-while-in-awaiting-confirmation test should reference the appropriate requirement codes (FR-5.8, TR-4.6) in its description rather than SC-26.
- **Actual:** SC-26 appears twice in the file referring to different behaviors.

---

### RV-14: SC-44/SC-45 auto-deal test has flawed conditional logic [Minor]

- **Category:** Test Reliability
- **Severity:** Minor
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-44/SC-45 — auto-deals 3 cards per player when all hands empty and deck has cards`
- **Related:** FR-6.2, US-6, SC-44, SC-45, T-15
- **Description:** The variable `anyHandEmpty` is named to suggest "any player has an empty hand" but is assigned `state.players.every((p) => p.hand.length === 0)`, which means all players have empty hands. The conditional `if (!anyHandEmpty)` then fires only when NOT all hands are empty — i.e., when new cards were dealt. If the round ends instead of triggering a new deal (because the deck became exhausted), the assertion block never fires and the test passes vacuously. The test comment reinforces the confusion: "A new deal was triggered — all players should have cards" implies the condition is correct, but the logic silently passes in the no-deal-triggered scenario.
- **Expected:** The test should unconditionally verify that after all 6 cards are played (3 per player), new hands were dealt if the deck was not empty. The deck after `initGame` with 2 players has 40 − 4 − 6 = 30 remaining cards, so a new deal is guaranteed. The conditional is unnecessary and weakens the test.
- **Actual:** The assertion may not fire depending on game progression.

---

### RV-15: SC-63 match score accumulation uses `>=` instead of strict equality [Minor]

- **Category:** Test Correctness
- **Severity:** Minor
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-63 — round points are added to accumulated match scores`
- **Related:** FR-8.3, US-8, SC-63, T-15
- **Description:** After a single exhausted round, each player's accumulated `matchScores` entry should equal exactly the total points earned in that round. The test uses `toBeGreaterThanOrEqual(score.total)` rather than `toBe(score.total)`. The comment explains this allows for "multiple rounds," but since `exhaustRound` always starts fresh from `initGame`, only one round is ever played. Using `>=` allows an inflated implementation to pass: if match scores accumulated more points than were actually earned, the test would not catch it.
- **Expected:** `expect(state.matchScores[score.playerId]).toBe(score.total)` for a single-round test context.
- **Actual:** `>=` is used, masking potential over-inflation.

---

### RV-16: SC-75 dealer rotation hardcodes turnIndex 1 without precondition [Minor]

- **Category:** Test Correctness
- **Severity:** Minor
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-75 — dealer rotates: second player becomes first in new round turn order`
- **Related:** FR-10.2, US-10, SC-75, T-15
- **Description:** The test calls `exhaustRound` (which plays through an entire 40-card game) and then asserts `engine.state()!.turnIndex === 1`. The hardcoded value of 1 assumes that after exhausting the round, the `turnIndex` happens to be 0, so `(0 + 1) % 2 === 1`. However, `exhaustRound` advances `turnIndex` on every `confirmTurn` call throughout the entire round (potentially 40+ times). The final `turnIndex` at round end is not guaranteed to be 0. If it happens to be 1 when the round ends, then `(1 + 1) % 2 === 0`, and the assertion `toBe(1)` would fail spuriously despite the implementation being correct.
- **Expected:** The test should capture the `turnIndex` at round end, compute the expected new index as `(capturedIndex + 1) % playerCount`, and assert against that computed value.
- **Actual:** Hardcoded `toBe(1)` is fragile.

---

### RV-17: SC-24 circular turn order uses 2-player config; BDD scenario specifies 3 players [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-24 — turn order wraps circularly (after last player returns to first)`
- **Related:** FR-4.3, SC-24, T-15
- **Description:** The BDD scenario for SC-24 uses a 3-player background (Alice, Bob, Carol) to verify circular wrap after Carol. The test uses `twoPlayerConfig()` (Alice, Bob) which only verifies the 2-player wrap. While `threePlayerConfig` is defined as a helper, it is never used in any test. The 3-player modulo boundary (index 2 → 0) is not tested; only the 2-player boundary (index 1 → 0) is.
- **Expected:** The circular wrap test should use `threePlayerConfig` to match the BDD scenario and verify that after Carol (index 2) plays and confirms, the active player returns to Alice (index 0).
- **Actual:** `threePlayerConfig` is unused. 3-player circular logic is not exercised.

---

### RV-18: SC-17 edge condition is never exercised — duplicate of SC-11 [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-17 — initial table deal does not award escobas even if cards sum to 15`
- **Related:** FR-2.4, SC-17, T-15
- **Description:** SC-17's distinguishing condition is that the initial 4 table cards sum to exactly 15 — this is the specific edge case that must not award an automatic escoba. The test asserts `escobaCount === 0` after `initGame`, which is identical to SC-11. Without engineering a deck where the first 4 cards sum to 15 (e.g., by preparing a deterministic deck ordering), the specific edge condition is never triggered. The test passes trivially regardless of whether the implementation has a bug that fires an escoba on this special deal.
- **Expected:** The test should prepare a controlled deck where the first 4 drawn cards (the table cards) are known to sum to 15, then verify no escoba is recorded.
- **Actual:** The test is functionally identical to SC-11 and provides no additional coverage.

---

### RV-19: SC-84 signal reactivity on startNextRound not verified [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Test:** `SC-84 — state signal emits a new reference after each action`
- **Related:** TR-4.3, SC-84, T-15
- **Description:** The SC-84 BDD scenario has three steps: state signal changes after `playCard`, after `confirmTurn`, and after `startNextRound`. The test covers the first two steps but omits the third. Whether `startNextRound` produces a new state signal reference is not verified here.
- **Expected:** After `exhaustRound` and `startNextRound`, the test should capture the state reference before and after and assert they differ.
- **Actual:** Third BDD step is missing.

---

### RV-20: `threePlayerConfig` helper defined but never used [Note]

- **Category:** Traceability
- **Severity:** Note
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Related:** FR-4.3, SC-24, SC-27, T-15
- **Description:** The `threePlayerConfig` helper function is defined at the top of the file alongside `twoPlayerConfig` but is never referenced in any test. BDD scenarios SC-24 and SC-27 both use 3-player backgrounds. The helper exists, suggesting 3-player tests were planned but not written.
- **Recommendation:** Either use `threePlayerConfig` in SC-24 (see RV-17) and write a dedicated SC-27 3-player confirmTurn test, or remove the unused helper to avoid confusion.

---

### RV-21: File header comment overstates scenario coverage [Note]

- **Category:** Traceability
- **Severity:** Note
- **File:** `src/app/core/services/game-engine.spec.ts`
- **Related:** SC-31, SC-40, SC-41, SC-43, SC-46, SC-48, SC-49, SC-68 (rejection), SC-77 (rejection)
- **Description:** The comment block at the top of the file claims BDD coverage of all scenarios from SC-08 through SC-85. The scenarios identified in RV-01, RV-05 through RV-10 (SC-31, SC-40, SC-41, SC-43, SC-46, SC-48, SC-49, SC-68 rejection path, SC-77 rejection path) are listed as covered but have no meaningful test implementation. The header creates a false impression of completeness.
- **Recommendation:** Update the BDD scenario header to omit or mark as partial the scenarios that are not yet meaningfully tested. This is a documentation concern only, not a behavioral risk.

---

## 4. Traceability Matrix

| Finding | Severity | Category         | Related Spec                             | File                |
| ------- | -------- | ---------------- | ---------------------------------------- | ------------------- |
| RV-01   | Critical | Test Quality     | FR-5.4, US-4, SC-40, SC-41, T-15         | game-engine.spec.ts |
| RV-02   | Major    | Test Quality     | FR-1.5, SC-07, T-12                      | deck.utils.spec.ts  |
| RV-03   | Major    | Test Correctness | FR-1.4, TR-2.3, SC-05, T-12              | deck.utils.spec.ts  |
| RV-04   | Major    | Test Reliability | FR-5.6, TR-4.6, SC-30, T-15              | game-engine.spec.ts |
| RV-05   | Major    | Test Coverage    | FR-5.2, US-3, SC-31, T-15                | game-engine.spec.ts |
| RV-06   | Major    | Test Coverage    | FR-5.4, US-4, SC-41, T-15                | game-engine.spec.ts |
| RV-07   | Major    | Test Coverage    | FR-7.3, US-7, SC-43, SC-49, T-15         | game-engine.spec.ts |
| RV-08   | Major    | Test Coverage    | FR-6.3, US-6, SC-46, T-15                | game-engine.spec.ts |
| RV-09   | Major    | Test Coverage    | FR-7.2, US-7, SC-48, T-15                | game-engine.spec.ts |
| RV-10   | Major    | Test Quality     | FR-9.5, US-9, US-10, SC-68, SC-77, T-15  | game-engine.spec.ts |
| RV-11   | Major    | Test Quality     | FR-8.4, SC-51, SC-82, T-15               | game-engine.spec.ts |
| RV-12   | Minor    | Test Coverage    | FR-1.2, SC-03, T-12                      | deck.utils.spec.ts  |
| RV-13   | Minor    | Traceability     | FR-5.8, TR-4.6, SC-26                    | game-engine.spec.ts |
| RV-14   | Minor    | Test Reliability | FR-6.2, US-6, SC-44, SC-45, T-15         | game-engine.spec.ts |
| RV-15   | Minor    | Test Correctness | FR-8.3, US-8, SC-63, T-15                | game-engine.spec.ts |
| RV-16   | Minor    | Test Correctness | FR-10.2, US-10, SC-75, T-15              | game-engine.spec.ts |
| RV-17   | Minor    | Test Coverage    | FR-4.3, SC-24, T-15                      | game-engine.spec.ts |
| RV-18   | Minor    | Test Coverage    | FR-2.4, SC-17, T-15                      | game-engine.spec.ts |
| RV-19   | Minor    | Test Coverage    | TR-4.3, SC-84, T-15                      | game-engine.spec.ts |
| RV-20   | Note     | Traceability     | FR-4.3, SC-24, SC-27, T-15               | game-engine.spec.ts |
| RV-21   | Note     | Traceability     | SC-31, SC-40, SC-41, SC-43, SC-46, SC-48 | game-engine.spec.ts |

---

## 5. Spec Compliance Summary

### BDD Scenario Coverage

| Scenario | Covered    | Quality                          | Finding |
| -------- | ---------- | -------------------------------- | ------- |
| SC-01    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-02    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-03    | ⚠️ Partial | ⚠️ Oros only                     | RV-12   |
| SC-04    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-05    | ⚠️ Partial | ⚠️ Logic error                   | RV-03   |
| SC-06    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-07    | ✅ Yes     | ❌ Tautological                  | RV-02   |
| SC-08    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-09    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-10    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-11    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-12    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-13    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-14    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-15    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-16    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-17    | ⚠️ Partial | ⚠️ Edge not exercised            | RV-18   |
| SC-18    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-19    | ⚠️ Partial | ⚠️ No known precondition values  | —       |
| SC-20    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-21    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-22    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-23    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-24    | ⚠️ Partial | ⚠️ 2-player only                 | RV-17   |
| SC-25    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-26    | ✅ Yes     | ⚠️ Mislabeled in playCard suite  | RV-13   |
| SC-27    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-28    | ✅ Yes     | ⚠️ Can silently skip             | —       |
| SC-29    | ✅ Yes     | ⚠️ Can silently skip             | —       |
| SC-30    | ⚠️ Partial | ⚠️ Non-deterministic             | RV-04   |
| SC-31    | ❌ No      | ❌ No test                       | RV-05   |
| SC-32    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-33    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-34    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-35    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-36    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-37    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-38    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-39    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-40    | ❌ No      | ❌ Dead test                     | RV-01   |
| SC-41    | ❌ No      | ❌ No test                       | RV-06   |
| SC-42    | ✅ Yes     | ⚠️ Can silently skip             | —       |
| SC-43    | ❌ No      | ❌ No test                       | RV-07   |
| SC-44    | ⚠️ Partial | ⚠️ Unreliable                    | RV-14   |
| SC-45    | ⚠️ Partial | ⚠️ Unreliable                    | RV-14   |
| SC-46    | ❌ No      | ❌ No test                       | RV-08   |
| SC-47    | ✅ Yes     | ✅ Covered via exhaustRound      | —       |
| SC-48    | ❌ No      | ❌ Wrong path tested             | RV-09   |
| SC-49    | ❌ No      | ❌ No test                       | RV-07   |
| SC-50    | ❌ No      | ❌ No test                       | —       |
| SC-51    | ⚠️ Partial | ⚠️ Structural only               | RV-11   |
| SC-52    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-53    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-54    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-55    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-56    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-57    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-58    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-59    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-60    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-61    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-62    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-63    | ⚠️ Partial | ⚠️ Uses >= not ===               | RV-15   |
| SC-64    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-65    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-66    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-67    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-68    | ⚠️ Partial | ⚠️ Rejection path never asserted | RV-10   |
| SC-69    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-70    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-71    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-72    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-73    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-74    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-75    | ⚠️ Partial | ⚠️ Fragile hardcoded index       | RV-16   |
| SC-76    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-77    | ⚠️ Partial | ⚠️ Rejection path never asserted | RV-10   |
| SC-78    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-79    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-80    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-81    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-82    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-83    | ✅ Yes     | ✅ Meaningful                    | —       |
| SC-84    | ⚠️ Partial | ⚠️ startNextRound step missing   | RV-19   |
| SC-85    | ✅ Yes     | ✅ Meaningful                    | —       |

---

## 6. Task Completion Summary

| Task | Title                       | Status      | Findings                                                                                                       |
| ---- | --------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| T-12 | Tests — deck utils          | ⚠️ Partial  | RV-02, RV-03, RV-12                                                                                            |
| T-13 | Tests — scoring utils       | ✅ Complete | —                                                                                                              |
| T-14 | Tests — win-condition utils | ✅ Complete | —                                                                                                              |
| T-15 | Tests — GameEngine service  | ⚠️ Partial  | RV-01, RV-04, RV-05, RV-06, RV-07, RV-08, RV-09, RV-10, RV-11, RV-13, RV-14, RV-15, RV-16, RV-17, RV-18, RV-19 |

**T-13 and T-14 are the strongest test files in this suite.** All acceptance criteria in tasks.md for T-13 and T-14 are met with meaningful assertions. The scoring utilities tests in particular are thorough and well-structured.

---

## 7. Test File Summary

| Test File                   | Type           | Overall Quality         | Key Issues                                                  |
| --------------------------- | -------------- | ----------------------- | ----------------------------------------------------------- |
| deck.utils.spec.ts          | Unit (pure fn) | ⚠️ Mostly meaningful    | SC-07 tautological, SC-05 assertion error, SC-03 partial    |
| win-condition.utils.spec.ts | Unit (pure fn) | ✅ Meaningful           | Minor traceability label (SC-69 header)                     |
| scoring.utils.spec.ts       | Unit (pure fn) | ✅ Meaningful           | None — complete per T-13 acceptance criteria                |
| game-engine.spec.ts         | Unit (TestBed) | ⚠️ Partially meaningful | 1 dead test, 9 missing coverage gaps, 2 hollow conditionals |

---

## 8. Angular Testing Conventions

Both conventions required by the spec and project instructions are correctly applied:

- Pure function utilities (deck, scoring, win-condition) are tested without TestBed. No Angular imports appear in those test files. ✅
- The GameEngine service test uses `TestBed.configureTestingModule({})` and `TestBed.inject(GameEngine)`. ✅
- Test descriptions reference requirement codes (FR-X.X, SC-XX, US-X) consistently in most tests. ✅

---

## 9. Security Cross-Reference

No security-relevant behavior is under test in this review. The game engine is a pure in-memory logic layer with no network calls, no DOM manipulation, no external data sources, and no user-provided input that reaches persistence. No security findings are applicable to these test files.

---

## 10. Recommendations

### Critical (must fix before writing implementation)

1. **RV-01 — Rewrite SC-40 escoba detection test.** The current test can never execute. Before implementing `GameEngine.playCard`, redesign the test to engineer a state where the table has exactly one card (by playing down from the initial four through prior confirmTurn cycles) and then verify the escoba trigger. Without this fix, the entire escoba detection mechanic (FR-5.4) will have no test coverage after implementation.

### Major (fix before declaring RED phase complete)

2. **RV-02 — Replace the tautological SC-07 immutability test** with one that verifies `Object.isFrozen` on created cards, or use a TypeScript compile-time assertion that the card's fields are `readonly`.

3. **RV-03 — Fix SC-05 assertion to compare `s1` against `s2`**, not `s1` against the original deck. The second shuffle result must appear in at least one assertion.

4. **RV-04 — Rewrite SC-30 with a controlled card setup** that guarantees the played card and table card cannot sum to 15. Remove the conditional branch that silently tests valid capture behavior instead of rejection.

5. **RV-05 — Add SC-31 test** for multiple valid capture subsets. Set up a state with two valid capture options and assert the player's explicit choice is honored while the alternative cards remain on the table.

6. **RV-06 — Add SC-41 test** verifying that making a second escoba in the same round increments `escobaCount` to 2.

7. **RV-07 — Add SC-43/SC-49 test** that reaches end-of-round with a non-null `lastCapturerId` and asserts the table card award does not increment `escobaCount`.

8. **RV-08 — Add SC-46 test** for the partial deal path: engineer a state where fewer than 6 cards remain in the deck when all hands become empty and verify first-player-priority distribution.

9. **RV-09 — Add SC-48 test** where at least one capture is made before exhausting the round, so `lastCapturerId` is non-null, then verify the specific player receives the remaining table cards.

10. **RV-10 — Add explicit rejection path for SC-68/SC-77.** Engineer a state where `matchWinner()` is non-null (by exhausting multiple rounds or by seeding scores close to 15), call `startNextRound`, and assert that state is unchanged.

11. **RV-11 — Strengthen SC-51 assertions.** After `exhaustRound`, assert the most-cards winner has `mostCards` equal to 1 or 2 (depending on captured pile size). Assert `total` equals the sum of all category fields for each player. Assert `roundNumber` matches.

### Minor (improve before implementation begins)

12. **RV-12 — Add value assertions for at least two other suits** in the SC-03 tests to verify FR-1.2 applies to all cards, not just Oros.

13. **RV-13 — Rename the SC-26 label in the playCard suite** to a non-conflicting requirement reference (FR-5.8 / TR-4.6) to remove the duplicate scenario ID.

14. **RV-14 — Remove the conditional from SC-44/SC-45** and make the assertion unconditional, since the deck always has 30 cards remaining after initGame in a 2-player game and a new deal is guaranteed.

15. **RV-15 — Change `>=` to strict equality `toBe`** in the SC-63 single-round match score test.

16. **RV-16 — Compute the expected turnIndex dynamically** in SC-75 rather than hardcoding `1`.

17. **RV-17 — Use `threePlayerConfig` in SC-24** to match the BDD scenario's 3-player background and cover the 3-player circular wrap boundary.

18. **RV-18 — Either prepare a controlled deck for SC-17** where the first 4 cards sum to 15, or merge SC-17 into SC-11 with a note that the edge condition requires a controlled deck.

19. **RV-19 — Add the startNextRound step to the SC-84 test** (verify state signal produces a new reference after `startNextRound`).

### Notes (informational)

20. **RV-20 — Either use `threePlayerConfig`** for SC-24/SC-27 tests or remove the unused helper.

21. **RV-21 — Update the file header comment** in `game-engine.spec.ts` to accurately reflect which scenarios are covered and which are pending.
