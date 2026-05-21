Feature: Player play and capture animation flows

  Background: Active gameplay turn is ready

    Given a game session has been configured with two players "Ana" and "Luis"
    And the game has been started from the lobby
    And a turn is ready for card play interactions

  Scenario: SC-01 — Player played card travels from hand to table with arc motion
    Given the player has selected a valid hand card
    And no table cards are selected for capture
    When the player submits the play action
    Then the selected card animates from hand to the center table zone
    And the movement follows an arc path
    And the card settles into the final table position after animation completes

  Scenario: SC-02 — Player played card applies required motion and timing envelope
    Given the player has selected a valid hand card
    And no table cards are selected for capture
    When the player submits the play action
    Then the card animation includes motion effect during travel
    And the animation duration is within 800 to 1200 milliseconds
    And the timing uses a natural ease-in-out motion profile

  Scenario: SC-04 — Captured table cards glow then disappear
    Given the player has selected a valid hand card
    And one or more table cards are selected for a valid capture
    When the player submits the play action
    Then each captured table card shows a capture glow effect
    And captured table cards fade and scale down out of view
    And captured table cards are removed from the table after animation completion

  Scenario: SC-05 — Multi-card capture animates simultaneously
    Given the player has selected a valid hand card
    And multiple table cards are selected for capture in one action
    When the player submits the play action
    Then all captured table cards begin capture animation at the same time
    And no captured card animation is staggered after another
