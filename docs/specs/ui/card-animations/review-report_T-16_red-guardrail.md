# Review Report: Card Animation System — Scope Guardrail Test (RED Phase)

**Review Mode:** Incremental (T-16: Align and execute E2E scenarios from BDD — SC-28 guardrail only)
**Source:** `docs/specs/ui/card-animations/`
**Reviewed against:** bdd-test.md (SC-28), tasks.md (T-16), design.md (AD-7), spec.md (FR-5), user-stories.md (US-5, US-8)
**Scope:** `cypress/e2e/scope-guardrail-remote-multiplayer.feature` and `cypress/e2e/scope-guardrail-remote-multiplayer.ts`
**Phase:** RED — tests expected to fail before implementation

## 1. Executive Summary

The scope guardrail test for SC-28 demonstrates clear intent and correct traceability. However, two of three Then-step assertions test pre-existing rendering behaviour that already passes without any T-16 animation implementation, reducing their value as RED phase guardrails. Only one assertion (the `data-opponent-animation-scope` attribute check) is genuinely RED for the animation feature. The "When" step semantics also deviate from the scenario intent — it simulates the local player completing a turn rather than a remote opponent completing one.

- Total findings: 4 (0 Critical, 1 Major, 2 Minor, 1 Note)
- Spec compliance: SC-28 intent partially covered; the guardrail concept is present but only one assertion actually guards against animation scope bleed
- Test quality: Partially meaningful — one strong contract assertion, two pre-existing-behaviour assertions

## 2. Findings

### RV-01: Two assertions test pre-existing conditional rendering, not animation scope guardrail [Major]

- **Category:** Test Quality
- **Severity:** Major
- **Related:** SC-28, AD-7, T-16, FR-5
- **Description:** The second assertion (no `ai-hand-zone` in multiplayer) and the third assertion (no `card-visual--animation-opponent` class in multiplayer) verify behaviour that is already enforced by the opponent-zones template's existing conditional: the AI hand zone only renders when `isAiOpponent(opponent)` is true, which it is not for human multiplayer opponents. These assertions pass regardless of whether any animation guardrail logic is implemented.
- **Expected:** RED phase assertions should fail before their corresponding GREEN implementation is written. All assertions in this test should require T-16 or animation-system implementation to pass.
- **Actual:** Assertions 2 and 3 pass immediately because the opponent-zones component never renders AI-specific elements for non-AI opponents. They validate pre-existing component logic rather than the animation feature's explicit scope boundary.
- **Recommendation:** These assertions are not wrong — they serve as regression guards for the existing rendering boundary. However, they create a false sense that the scope guardrail is "mostly passing" when in fact only one assertion (the `data-opponent-animation-scope` attribute) tests the animation-feature-specific contract. Consider supplementing with an assertion that the animation metadata input is either not passed or is explicitly ignored in multiplayer mode, which would be a genuinely RED assertion against the animation orchestration layer.
- **Impact:** Without addressing this, the test provides weaker confidence than it appears. A developer could merge animation code that accidentally applies opponent animation metadata in multiplayer context and these two assertions would still pass (since the AI zone isn't rendered anyway). The actual guardrail against animation scope bleed relies solely on assertion 1.

### RV-02: "When" step simulates local player turn, not remote opponent turn [Minor]

- **Category:** Test Quality
- **Severity:** Minor
- **Related:** SC-28, T-16
- **Description:** The scenario step "When a remote multiplayer turn is completed" suggests a remote opponent finishes their turn. The step definition implementation has the local player selecting a hand card, submitting play, and confirming the turn — simulating the local player completing their own turn, not a remote opponent's turn.
- **Expected:** The step semantics should align with what the code actually exercises. The BDD spec's original wording was "When opponent animation coverage is evaluated" which is more of a policy assertion. The test implementation should either rename the step to reflect what it does or restructure to simulate turn handoff to the second player.
- **Actual:** The step is named "a remote multiplayer turn is completed" but executes the first player's turn. In local multiplayer (which is what the application supports), a "remote" turn doesn't exist — both players share the device. The step name implies network synchronization that isn't part of the application.
- **Recommendation:** Rename the step to something like "a player turn completes in multiplayer mode" to accurately describe what the code does. This avoids confusion about whether the test covers remote/network scenarios (which don't exist in the application).
- **Impact:** Low — this is a naming/clarity issue. The test still exercises a meaningful state transition (post-turn in multiplayer mode) for the Then assertions to evaluate.

### RV-03: `data-opponent-animation-scope` attribute is a design-by-contract marker not yet in source [Minor]

- **Category:** Test Coverage
- **Severity:** Minor
- **Related:** SC-28, AD-7, T-16
- **Description:** The first Then assertion checks for `data-opponent-animation-scope="single-player-ai-only"` on the opponent-zones element. This attribute does not exist anywhere in the source code. The test establishes a contract that must be fulfilled in the GREEN phase.
- **Expected:** For RED phase, this is the correct pattern — the test defines the expected contract and fails until implementation provides it. The attribute serves as an explicit declarative marker of scope boundary.
- **Actual:** The attribute exists only in the test file's assertion. The screenshot directory confirms this test has failed (as expected for RED phase).
- **Recommendation:** This is well-designed as a RED phase contract. During GREEN phase implementation, add this data attribute to the opponent-zones component template, conditionally bound based on session mode. Ensure it is not merely a hardcoded attribute but is driven by the actual scope determination logic.
- **Impact:** None in RED phase — this is functioning as intended.

### RV-04: No assertion guards against animation metadata reaching multiplayer opponent zones [Note]

- **Category:** Test Coverage
- **Severity:** Note
- **Related:** SC-28, AD-7, FR-5, US-5, US-8
- **Description:** The opponent-zones component receives an `[animationMetadata]` input from the game-table-page. The test does not verify that animation metadata is absent, empty, or ignored when in multiplayer mode. A subtle bug could allow animation metadata to flow into multiplayer opponent zones without triggering any of the current assertions (since the AI hand zone doesn't render for human opponents, the metadata would have no visual effect but would represent a scope violation at the data layer).
- **Expected:** A comprehensive scope guardrail would verify both the rendering layer (no AI elements visible) and the data layer (no animation metadata flows to non-AI opponents).
- **Actual:** Only rendering-layer assertions are present.
- **Recommendation:** Consider adding an assertion that verifies the opponent-zones element does not receive or expose animation metadata attributes in multiplayer mode. This would catch scope violations at the orchestration layer before they could manifest as bugs if the template ever changes.
- **Impact:** Low risk currently because the template conditional prevents any visual leakage. This is a defense-in-depth suggestion.

## 3. Traceability Matrix

| Finding | Severity | Category      | Related Spec                  | Status                   |
| ------- | -------- | ------------- | ----------------------------- | ------------------------ |
| RV-01   | Major    | Test Quality  | SC-28, AD-7, FR-5, T-16       | Open                     |
| RV-02   | Minor    | Test Quality  | SC-28, T-16                   | Open                     |
| RV-03   | Minor    | Test Coverage | SC-28, AD-7, T-16             | Open (by design for RED) |
| RV-04   | Note     | Test Coverage | SC-28, AD-7, FR-5, US-5, US-8 | Open                     |

## 4. Spec Compliance Summary (SC-28 Only)

| Requirement                   | Status     | Notes                                                                                                               |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| FR-5 (scope constraint)       | ⚠️ Partial | Scope boundary is tested at rendering layer but only one of three assertions is genuinely RED for animation feature |
| AD-7 (single-player AI only)  | ⚠️ Partial | Decision is tested via explicit marker attribute (good); absence of AI elements also asserted but pre-existing      |
| US-5 (AI opponent animation)  | ✅ Met     | Negative boundary (multiplayer exclusion) is covered                                                                |
| US-8 (full AI turn animation) | ✅ Met     | Negative boundary (multiplayer exclusion) is covered                                                                |

## 5. Task Completion Summary (T-16 — SC-28 Scope)

| Task | Title                                            | Status     | Findings            |
| ---- | ------------------------------------------------ | ---------- | ------------------- |
| T-16 | Align and execute E2E scenarios from BDD (SC-28) | ⚠️ Partial | RV-01, RV-02, RV-04 |

## 6. Test Coverage Summary

| Scenario | Step Definitions | Meaningful | Findings            |
| -------- | ---------------- | ---------- | ------------------- |
| SC-28    | ✅ Yes           | ⚠️ Partial | RV-01, RV-02, RV-04 |

## 7. Test Quality Summary

| Test File                                  | Type        | Meaningful Assertions | Issues                                                                                  |
| ------------------------------------------ | ----------- | --------------------- | --------------------------------------------------------------------------------------- |
| scope-guardrail-remote-multiplayer.feature | E2E Feature | ⚠️ Partial            | Scenario is well-structured                                                             |
| scope-guardrail-remote-multiplayer.ts      | E2E Steps   | ⚠️ Partial            | 1 of 3 assertions is genuinely RED; 2 test pre-existing behaviour; step naming mismatch |

## 8. Recommendations

### Major (fix before merge)

1. Supplement the test with at least one assertion that is genuinely RED against the animation orchestration layer in multiplayer mode — such as verifying animation metadata is absent or that the orchestrator does not create opponent animation groups in multiplayer. This ensures the scope guardrail has teeth beyond pre-existing rendering conditionals.

### Minor (improvement)

1. Rename the "When" step from "a remote multiplayer turn is completed" to "a player turn completes in multiplayer mode" for accuracy.
2. The `data-opponent-animation-scope` attribute contract is sound for RED phase — proceed to GREEN implementation with appropriate conditional binding logic.

### Notes (informational)

1. Consider a data-layer assertion for animation metadata absence in multiplayer context as defense-in-depth for future template changes.
