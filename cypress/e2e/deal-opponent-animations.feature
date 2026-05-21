Feature: Deal and opponent animation flows

  # Covers: SC-07, SC-08, SC-12

  Background: Single-player game session is active

    Given a single-player game session has been configured
    And the game has been started and the player has taken a turn

  Scenario: SC-07 — New cards animate from deck source into hand positions

    Given the player hand is ready to receive new cards after a turn
    When the turn is confirmed and deal resolves
    Then each new hand card carries the deal animation class
    And dealt cards are interactable after animation completes

  Scenario: SC-08 — Three-card deal animates simultaneously across layouts

    Given three cards are being dealt to the player hand
    When the deal action resolves
    Then all three newly dealt hand cards show the deal animation simultaneously
    And no dealt card animation delay differs from another

  Scenario: SC-12 — AI play animates with same visual language as player

    Given it is the AI opponent turn in single-player mode
    When the AI performs a play action
    Then the AI played card carries the opponent animation class
    And the opponent animation duration is within 800 to 1200 milliseconds
    And the opponent animation timing uses a natural ease-in-out motion profile
