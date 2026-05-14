Feature: Single Player AI Turn Flow

  Background:
    Given a single player game has been started on Easy difficulty

  Scenario: SC-06 - Laia's turn begins automatically without any human action
    When the capture fixture is applied
    Then Laia's turn begins automatically

  Scenario: SC-10 - Full capture animation is shown when Laia makes a capture
    When the capture fixture is applied
    Then Laia's hand zone becomes active
    And one AI hand card is highlighted
    And the selected card is revealed face up
    And the table capture subset is highlighted

  Scenario: SC-11 - Placement animation is shown when Laia places a card on the table
    When the placement fixture is applied
    Then Laia's hand zone becomes active
    And one AI hand card is highlighted
    And the selected card remains face down
    And no table cards are revealed

  Scenario: SC-14 - Human controls are disabled during Laia's turn
    When the capture fixture is applied
    Then the human controls are disabled

  Scenario: SC-15 - Submit Play and Confirm Turn buttons are disabled and visually non-interactive during Laia's turn
    When the capture fixture is applied
    Then the "Submit Play" button is visually disabled
    And the "Confirm Turn" button is visually disabled
    And neither button can be activated by the human

  Scenario: SC-16 - Human controls are re-enabled after Laia's turn resolves
    When the placement fixture is applied
    And the AI animation completes
    Then the human controls are re-enabled

  Scenario: SC-18 - Laia's cards are always face-down
    When the placement fixture is applied
    Then all AI hand cards are face down

  Scenario: SC-19 - The card Laia plays for a capture is revealed face-up
    When the capture fixture is applied
    Then the selected AI card is face up

  Scenario Outline: SC-23/SC-28/SC-33 - escoba priority is available via deterministic fixture
    Given a single player game has been started on <difficulty> difficulty
    When the "<fixture>" fixture is applied
    Then Laia's decision is an escoba

    Examples:
      | difficulty  | fixture        |
      | Easy        | ai-turn-escoba |
      | Medium      | ai-turn-escoba |
      | Hard        | ai-turn-escoba |

  Scenario: SC-43 - Round scores appear for both players after a round completes
    When the round-complete fixture is applied
    Then the round result is visible for both players

  Scenario: SC-44 - Match over overlay shows the winner name
    When the Laia winner fixture is applied
    Then the match over overlay shows the winner name

  Scenario: SC-45 - Match over overlay shows the correct winner after a full match flow
    When the human winner fixture is applied
    Then the winner appears in the match over overlay

  Scenario: SC-46 - The handoff overlay is never shown during a Single Player match
    When the capture fixture is applied
    And the AI animation completes
    And the round-complete fixture is applied
    Then the handoff overlay is never displayed
    And turns advance without handoff interruption

  Scenario: SC-47 - The player can return to the Lobby from the match-over overlay
    When the human winner fixture is applied
    And the player returns to the lobby from the match over overlay
    Then the Lobby screen is displayed
