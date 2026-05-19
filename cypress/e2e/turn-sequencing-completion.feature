Feature: Turn sequencing waits for animation completion

  Rule: Completion-driven progression

    Background:
      Given a game session has been configured with two players "Ana" and "Luis"
      And the game has been started from the lobby

    Scenario: SC-17 — Game applies required pause before advancing phase
      Given an action animation has just completed
      And the next turn phase has not started yet
      When the transition pause is evaluated
      Then the game waits for a pause within 500 to 800 milliseconds
      And the next phase starts only after the pause completes

    Scenario: SC-18 — Missing animation completion signal does not deadlock turn progression
      Given an action animation fails to emit a completion signal
      When transition orchestration evaluates timeout or fallback handling
      Then the game does not remain permanently blocked in the transition state
      And progression recovers to a valid next phase behavior

    Scenario: SC-19 — Reduced-motion mode still enforces transition pause
      Given reduced-motion preference is enabled
      And an action has resolved with instant visual updates
      When transition orchestration runs
      Then the game still enforces a pause within 500 to 800 milliseconds
      And the next phase starts only after pause completion
