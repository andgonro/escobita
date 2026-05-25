# Spec: Laia Hand Capture Animation Bleed

## Overview

This specification defines the expected behavior to prevent opponent hand cards from receiving capture glow effects during human capture actions. The goal is strict visual isolation between capture effects and non-participating card zones, while preserving valid opponent-turn animation behavior.

## Functional Requirements

### FR-1.1 Human Capture Visual Scope

When the human player performs a capture, capture glow and capture transition effects shall apply only to cards that are part of that capture event.

- Participating cards include the played card and captured table cards associated with the human action.
- Non-participating zones shall not receive capture-state visual effects.

### FR-1.2 Opponent Hand Inertness During Human Capture

During any human capture action, all visible cards in Laia's hand area shall remain visually static.

- No glow, flash, fade, scale, or capture-state styling is allowed on Laia hand cards.
- This behavior shall be consistent for every capture scenario.

### FR-1.3 Always-Reproducible Regression Coverage

Because the issue is always reproducible in current behavior, the fixed behavior shall be validated for every capture path and not only selected examples.

- Single-card capture scenarios shall comply.
- Multi-card capture scenarios shall comply.
- Escoba and non-Escoba capture outcomes shall comply.

### FR-1.4 Opponent Animation Eligibility

Laia hand cards may animate only when an explicit opponent-turn animation phase requires it.

- Human-turn capture events must never implicitly trigger opponent hand capture visuals.
- Opponent-turn visuals must not reuse or inherit human capture animation group intent.

## Technical Requirements

### TR-1.1 Animation Metadata Zone Isolation

Animation metadata generation shall preserve strict zone boundaries.

- Data that represents table capture participation shall not be interpreted as opponent hand animation targets.
- Opponent hand metadata shall be sourced only from opponent-turn animation context.

### TR-1.2 Suppression Guard Enforcement

The existing opponent animation suppression intent shall be enforced for all human-turn capture transitions.

- Any fallback behavior that broadens capture animation assignment into opponent hand context shall be removed or neutralized.
- Suppression behavior shall be deterministic and independent of capture size.

### TR-1.3 Deterministic Mapping Rules

Animation target mapping rules shall avoid index-based side effects that can project capture state onto unrelated zones.

- Capture target selection shall use participation identity rather than positional coincidence with opponent hand elements.
- Mapping logic shall remain stable across responsive layouts and hand-size changes.

### TR-1.4 Documentation and Traceability

The implementation handoff shall maintain clear traceability from this defect spec to related UI animation artifacts.

- Requirement identifiers in this spec shall be referenced by testing and review artifacts where applicable.
- The defect scope and expected behavior boundaries shall be documented unambiguously.

## Non-Functional Requirements

### NFR-1.1 Visual Correctness and Trust

UI feedback shall never imply opponent participation in a human capture when none occurred.

- Visual state must accurately represent gameplay participation.
- No false-positive capture cues in opponent hand zone are permitted.

### NFR-1.2 Consistency

Behavior shall be consistent across all capture scenarios and session states where the bug was previously reproducible.

- No intermittent or mode-dependent exceptions are acceptable.

### NFR-1.3 Accessibility Stability

Fixing this defect shall not degrade current accessibility behavior.

- Reduced-motion behavior must continue to respect motion preference rules.
- Keyboard and focus workflows must remain unaffected by animation isolation changes.

### NFR-1.4 Performance Neutrality

The isolation fix shall not introduce noticeable UI lag or animation stutter.

- Capture feedback should remain responsive under normal gameplay conditions.

## Out of Scope

- Redesigning the entire animation framework.
- Changing game logic, turn resolution rules, or scoring mechanics.
- Introducing new animation themes, visual styles, or celebratory effects beyond defect correction.
- Expanding multiplayer synchronization behavior outside this specific defect.

## Future Considerations

- Add explicit zone-isolation guardrails to broader animation architecture guidance.
- Extend regression suites to cover additional cross-zone animation contamination risks.
- Consider centralized validation rules for animation metadata generation across all card zones.
