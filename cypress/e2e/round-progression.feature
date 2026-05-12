Feature: Round progression continuation

  Rule: Round-Complete State

    Background:
      Given a game session has been configured with two players "Ana" and "Luis"
      And the game has been started from the lobby

    Scenario: SC-01 - Game table enters round-complete state when the final turn of a round is confirmed
      Given it is the last turn of round 1 with no cards remaining in either player's hand
      When the active player confirms their final turn
      Then the game table enters a visually distinct round-complete state
      And the round result area displays the per-player score breakdown
      And a continuation action button is visible

    Scenario: SC-02 - Round number and top score remain visible in the round-complete state
      Given the game table has entered the round-complete state after round 2
      When the player views the HUD
      Then the round number "2" is visible
      And the highest individual score earned in that round is visible

    Scenario: SC-03 - Per-player score breakdown shows all six scoring categories for each player
      Given the game table has entered the round-complete state
      When the player views the round result area
      Then for each player the following scoring categories are displayed: escobas, most cards, most Oros, most sevens, Siete de Oros, and total
      And each player's name is displayed alongside their score entries

    Scenario: SC-04 - Zero-point categories are shown and not omitted from the round score breakdown
      Given a round has ended where "Ana" earned 0 points in the escobas category
      When the player views the round result area
      Then "Ana"'s escobas score is shown as 0
      And the escobas row is not hidden or omitted from "Ana"'s breakdown

    Scenario: SC-05 - Player names in the score breakdown match the session-configured names
      Given the session was configured with player names "Ana" and "Luis"
      When the round-complete state is active and the player views the score breakdown
      Then the name "Ana" appears in the breakdown
      And the name "Luis" appears in the breakdown
      And no other player names appear in the breakdown

    Scenario: SC-06 - Board zones remain rendered and inspectable during the round-complete state
      Given the game table has entered the round-complete state
      When the player views the game board
      Then the table-card zone is rendered and visible
      And the opponent zone is rendered and visible
      And the active hand zone is rendered and visible
      And no zones are hidden, collapsed, or artificially disabled

    Scenario: SC-07 - Score breakdown is no longer visible after a continuation action is activated
      Given the game table is in the round-complete state with the score breakdown visible
      And no match winner has been declared
      When the player activates the "Start Next Round" button
      Then the round score breakdown is no longer visible
      And the "Start Next Round" button is no longer visible

    Scenario: SC-42 - A live-region announcement is made when a round ends
      Given the game table is in an active round
      When the active player confirms the final turn of the round
      Then a live-region announcement is made indicating that the round has been completed

  Rule: Start Next Round

    Background:
      Given a game session has been configured with two players "Ana" and "Luis"
      And the game has been started from the lobby
      And a round has ended with the round result available
      And no match winner has been declared

    Scenario: SC-08 - "Start Next Round" button is visible when round is complete and no winner is declared
      When the player views the round result area
      Then the "Start Next Round" button is visible

    Scenario: SC-09 - "Start Next Round" button is not visible when a match winner has been declared
      Given a match winner has been declared
      When the player views the round result area
      Then the "Start Next Round" button is not visible

    Scenario: SC-10 - "View Winner" button appears in place of "Start Next Round" when a match winner is declared
      Given a match winner has been declared
      When the player views the round result area
      Then the "View Winner" button is visible
      And the "Start Next Round" button is not visible
      But only one of the two continuation buttons is shown at any time

    Scenario: SC-11 - Activating "Start Next Round" calls startNextRound and clears the round result
      Given the "Start Next Round" button is visible in the round result area
      When the player activates the "Start Next Round" button
      Then the game engine's startNextRound action is triggered
      And the round score breakdown disappears
      And the "Start Next Round" button disappears

    Scenario: SC-12 - Board reflects the new initial deal after "Start Next Round" is activated
      Given the player is in the round-complete state at the end of round 1
      When the player activates the "Start Next Round" button
      Then 4 fresh cards are visible on the table
      And each player has 3 hand cards
      And the round number shown in the HUD is 2

    Scenario: SC-13 - "Start Next Round" button is reachable and operable by keyboard navigation
      Given the game table is in the round-complete state with the "Start Next Round" button visible
      When the player navigates to the "Start Next Round" button using the keyboard
      Then the button receives keyboard focus
      And activating the button by keyboard triggers the start-next-round action

    Scenario: SC-14 - "Start Next Round" button carries a meaningful accessible label in Spanish
      Given the game table is in the round-complete state
      When an assistive technology reads the "Start Next Round" button
      Then the button exposes an accessible label written in Spanish