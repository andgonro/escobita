Feature: Escoba burst emphasis

  Background:
    Given a single player game has been started for escoba burst checks

  Scenario: SC-14 — Escoba clears table with enhanced required special effect
    When the "ai-turn-escoba" fixture is applied for escoba burst checks
    Then an escoba burst animation is visible on clearing table cards

  Scenario: SC-15 — Escoba timing is faster than normal capture timing
    When the "ai-turn-escoba" fixture is applied for escoba burst checks
    Then escoba animation duration is within 600 to 800 milliseconds

  Scenario: SC-16 — Reduced-motion mode disables Escoba special motion
    Given reduced-motion preference is enabled for escoba burst checks
    When the "ai-turn-escoba" fixture is applied for escoba burst checks
    Then escoba special motion is disabled
