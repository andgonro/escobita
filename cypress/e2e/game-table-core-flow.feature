Feature: Hand and Submission Flow

  Scenario: SC-07 - only active player hand cards are interactive
    Given it is player A turn
    When player B attempts to interact with hand cards
    Then interaction is blocked for non-active players

  Scenario: SC-11 - player can select one or more table cards for capture subset
    Given a hand card is selected
    When the player toggles table cards
    Then subset selection state updates for each card

  Scenario: SC-12 - invalid capture subset is blocked before execution
    Given selected hand card and selected table subset do not form a legal capture
    When the player attempts to submit play
    Then submission is blocked
    And validity feedback is shown

  Scenario: SC-09 - submit is blocked without selected hand card
    Given no hand card is selected
    When the player submits play from the action bar
    Then submission is blocked
    And clear feedback is shown

  Scenario: SC-13 - empty subset results in placement behavior
    Given a hand card is selected and no table cards are selected
    When the player submits play from the action bar
    Then the action is treated as table placement
    And missed-capture auto-correction is not applied

  Scenario: SC-14 - valid capture updates resulting table state
    Given a legal capture subset is selected
    When the player submits play from the action bar
    Then resulting table state reflects captured cards removed
    And hand state reflects played card removal

  Scenario: SC-27 - play submission maps to engine play action
    Given a legal capture subset is selected
    When the player submits play from the action bar
    Then resulting table state reflects captured cards removed
    And hand state reflects played card removal
    And turn phase reflects pending confirmation

  Scenario: SC-10 - play submission and turn completion are separate actions
    Given the match mode is single-player
    When a single-player play is submitted
    Then turn phase reflects pending confirmation
    When the single-player turn completion is confirmed
    Then turn advances after confirmation in single-player mode
    And turn phase returns to awaiting-card-play state
