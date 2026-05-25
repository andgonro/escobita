Feature: Scope guardrail for remote multiplayer opponent animation

  # Covers: SC-28

  Scenario: SC-28 — remote multiplayer opponent animation remains out of scope
    Given a multiplayer game is in progress for scope guardrail verification
    When a local multiplayer turn is completed
    Then opponent animation scope is explicitly marked as single-player AI only
    And the scope guardrail marker remains explicit after multiplayer turn completion
