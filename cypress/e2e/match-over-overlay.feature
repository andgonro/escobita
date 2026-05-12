Feature: Match-over overlay continuation

  Rule: Match-Over Overlay

    Background:
      Given a game session has been configured with two players "Ana" and "Luis"
      And the final round has ended with a match winner declared
      And the round-complete state is active with the "View Winner" button visible

    Scenario: SC-15 - Activating "View Winner" transitions to the match-over state
      When the player activates the "View Winner" button
      Then the match-over overlay appears
      And the round-complete state is no longer shown

    Scenario: SC-16 - Match-over overlay does not appear automatically when a match winner is declared
      Given the player has not yet activated the "View Winner" button
      When the match winner signal becomes non-null at round end
      Then the match-over overlay is not visible
      And the round-complete state with the "View Winner" button is shown instead

    Scenario: SC-17 - Match-over overlay appears as a full-screen layer on top of all game table content
      Given the player has activated the "View Winner" button
      When the match-over overlay is visible
      Then the overlay covers the entire game table viewport
      And no game table content is visible above the overlay

    Scenario: SC-18 - Overlay displays the sole winner's name prominently
      Given "Ana" is the sole match winner
      And the player has activated the "View Winner" button
      When the match-over overlay is visible
      Then "Ana"'s name is prominently displayed in the overlay

    Scenario: SC-19 - Overlay displays all co-winners' names with equal prominence when players tie
      Given "Ana" and "Luis" have both ended the round with the same accumulated score at or above 15 points
      And the player has activated the "View Winner" button
      When the match-over overlay is visible
      Then both "Ana"'s name and "Luis"'s name are displayed in the overlay
      And both names are displayed with equal visual prominence
      And no additional round is offered or started to break the tie

    Scenario: SC-20 - Overlay displays final accumulated match scores, not round scores
      Given the player has activated the "View Winner" button
      When the match-over overlay is visible
      Then the accumulated match score for "Ana" is shown
      And the accumulated match score for "Luis" is shown
      And the scores shown reflect all rounds played in the match, not only the final round

    Scenario: SC-21 - Overlay is not dismissed by pressing Escape
      Given the match-over overlay is visible
      When the player presses the Escape key
      Then the overlay remains visible

    Scenario: SC-22 - Overlay is not dismissed by clicking outside it
      Given the match-over overlay is visible
      When the player clicks on the game table content behind the overlay
      Then the overlay remains visible

    Scenario: SC-23 - Background game table content is inert and hidden from assistive technology while overlay is active
      Given the match-over overlay is visible
      When the player attempts to interact with the HUD, board zones, or action bar
      Then those elements do not respond to pointer or keyboard interaction
      And those elements are marked as hidden from assistive technology

    Scenario: SC-24 - "View Winner" button is reachable and operable by keyboard navigation
      Given the round-complete state is active with the "View Winner" button visible
      When the player navigates to the "View Winner" button using the keyboard
      Then the button receives keyboard focus
      And activating the button by keyboard triggers the match-over overlay to appear

    Scenario: SC-25 - Match-over overlay has an accessible role and name identifying it as a modal dialog
      Given the player has activated the "View Winner" button
      When an assistive technology inspects the match-over overlay
      Then the overlay is identified as a modal dialog
      And the overlay has an accessible name

    Scenario: SC-26 - Focus moves into the match-over overlay when it appears
      Given the player is focused on the "View Winner" button
      When the player activates the "View Winner" button and the match-over overlay appears
      Then focus moves to a focusable element inside the overlay
      And focus is not left on the background game table content

    Scenario: SC-27 - Live-region announces the match winner or co-winners when the overlay appears
      Given the player has activated the "View Winner" button
      When the match-over overlay becomes visible
      Then a live-region announcement is made identifying the match winner or all co-winners

  Rule: Return to Lobby

    Background:
      Given a game session has been configured with player names "Ana" and "Luis", a game mode, and an AI difficulty setting
      And a match has concluded with a winner
      And the player has activated the "View Winner" button
      And the match-over overlay is visible

    Scenario: SC-28 - "Return to Lobby" button is present on the match-over overlay
      When the player views the match-over overlay
      Then the "Return to Lobby" button is visible

    Scenario: SC-29 - Activating "Return to Lobby" navigates to the Lobby screen
      When the player activates the "Return to Lobby" button
      Then the application navigates to the root route
      And the Lobby screen is rendered

    Scenario: SC-30 - Lobby form opens pre-filled with the previous session settings after returning
      When the player activates the "Return to Lobby" button and the Lobby screen appears
      Then the lobby form is pre-filled with the player names "Ana" and "Luis"
      And the previous game mode is pre-filled
      And the previous AI difficulty is pre-filled

    Scenario: SC-31 - Rapid repeated activations of "Return to Lobby" do not cause multiple navigations
      When the player activates the "Return to Lobby" button multiple times in rapid succession
      Then the application navigates to the Lobby screen only once
      And no errors occur

    Scenario: SC-32 - "Return to Lobby" button is reachable and operable by keyboard navigation
      When the player navigates to the "Return to Lobby" button using the keyboard
      Then the button receives keyboard focus
      And activating the button by keyboard triggers navigation to the Lobby screen

    Scenario: SC-33 - Focus reaches the lobby's primary control after navigating to the lobby
      When the player activates "Return to Lobby" and the Lobby screen appears
      Then focus is placed on the lobby's primary interactive control

  Rule: Play Again

    Background:
      Given a game session has been configured with player names "Ana" and "Luis", a game mode, and an AI difficulty setting
      And a match has concluded with a winner
      And the player has activated the "View Winner" button
      And the match-over overlay is visible

    Scenario: SC-34 - "Play Again" button is present on the match-over overlay
      When the player views the match-over overlay
      Then the "Play Again" button is visible

    Scenario: SC-35 - Activating "Play Again" dismisses the overlay and starts a new round 1 board
      When the player activates the "Play Again" button
      Then the match-over overlay is dismissed
      And the game table displays the new round 1 board state
      And the application has not navigated away from the game table route

    Scenario: SC-36 - New match uses the same session configuration as the previous match
      When the player activates the "Play Again" button
      Then the new match uses the player names "Ana" and "Luis"
      And the same game mode is used
      And the same AI difficulty is used

    Scenario: SC-37 - New match starts at round 1 with all accumulated scores reset to zero and a fresh deal
      When the player activates the "Play Again" button
      Then the round number shown in the HUD is 1
      And each player's accumulated match score is 0
      And 4 fresh cards are visible on the table
      And each player has 3 hand cards

    Scenario: SC-38 - Game table is fully interactive after "Play Again"
      Given the player has activated "Play Again" and the new round 1 board is displayed
      When the player views the game table
      Then hand cards are selectable
      And the action bar controls respond correctly to the current turn phase

    Scenario: SC-39 - "Play Again" works correctly even when the previous engine state was non-null
      Given the previous match ended with a non-null engine state
      When the player activates the "Play Again" button
      Then a fresh match is started unconditionally, bypassing any initialisation guard
      And the game table shows the new round 1 board state

    Scenario: SC-40 - "Play Again" button is reachable and operable by keyboard navigation
      When the player navigates to the "Play Again" button using the keyboard
      Then the button receives keyboard focus
      And activating the button by keyboard triggers the new match to begin

    Scenario: SC-41 - Focus moves to the "Submit play" button on the game table after "Play Again"
      When the player activates the "Play Again" button and the overlay is dismissed
      Then focus moves to the "Submit play" button on the game table
