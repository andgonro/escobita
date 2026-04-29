Feature: Lobby setup

  Scenario: SC-01 - Lobby screen is displayed when opening root URL
    Given I open the lobby screen
    Then I should see the "La Escobini Kapitxorna" heading
    And the application should stay on the lobby route

  Scenario: SC-02 - Lobby remains visible without interaction
    Given I open the lobby screen
    When I wait briefly without interaction
    Then I should see the "La Escobini Kapitxorna" heading
    And the application should stay on the lobby route

  Scenario: SC-03 - Starting from valid form reaches game-board route without routing error
    Given I open the lobby screen
    And the "Jugar" button is enabled
    When I press the "Jugar" button
    Then the application should navigate to the game board route

  Scenario: SC-04 - Lobby heading is the primary heading
    Given I open the lobby screen
    Then the lobby heading should be the primary heading

  Scenario: SC-05 - Hero area contains decorative thematic element
    Given I open the lobby screen
    Then a decorative card-game element should be visible in the hero area

  Scenario: SC-06 - Hero area has no interactive controls
    Given I open the lobby screen
    Then the hero area should not contain interactive controls

  Scenario: SC-07 - Single Player is selected by default
    Given I open the lobby screen
    Then the "Single Player" mode is selected
    And the "Multiplayer" mode is not selected

  Scenario: SC-08 - Selecting Multiplayer shows multiplayer fields
    Given I open the lobby screen
    When I switch to "Multiplayer" mode
    Then the player-count selector is displayed
    And I should see 2 multiplayer name fields
    And the AI difficulty selector is hidden
    And the AI opponent name area is hidden

  Scenario: SC-09 - Selecting Single Player shows single-player fields
    Given I open the lobby screen
    When I switch to "Multiplayer" mode
    And I switch to "Single Player" mode
    Then the single player name input is visible
    And the AI opponent name area is visible
    And the AI difficulty selector is visible
    And the player-count selector is hidden

  Scenario: SC-10 - Mode selector cannot be de-selected to empty state
    Given I open the lobby screen
    And the "Single Player" mode is selected
    When I click the currently selected "Single Player" mode option
    Then the "Single Player" mode is selected
    And no mode de-selected state is possible

  Scenario: SC-11 - Switching to Multiplayer hides AI difficulty
    Given I open the lobby screen
    And the AI difficulty selector is visible
    When I switch to "Multiplayer" mode
    Then the AI difficulty selector is hidden

  Scenario: SC-12 - Switching to Single Player hides player-count selector
    Given I open the lobby screen
    When I switch to "Multiplayer" mode
    Then the player-count selector is displayed
    When I switch to "Single Player" mode
    Then the player-count selector is hidden

  Scenario: SC-13 - Single Player shows exactly one editable name field
    Given I open the lobby screen
    Then exactly one single-player name input is visible

  Scenario: SC-14 - Single Player name is pre-filled with Jugador-1
    Given I open the lobby screen
    Then single player name should contain "Jugador-1"

  Scenario: SC-15 - AI opponent is fixed read-only name Laia
    Given I open the lobby screen
    Then I should see the AI opponent name "Laia"
    And the AI opponent name should be read-only text

  Scenario: SC-16 - AI difficulty options are Easy Medium Hard
    Given I open the lobby screen
    Then the AI difficulty selector should offer "Easy", "Medium", and "Hard"

  Scenario: SC-17 - AI difficulty defaults to Easy
    Given I open the lobby screen
    Then the AI difficulty selector should have "Easy" selected

  Scenario: SC-18 - AI difficulty resets to Easy after mode round-trip
    Given I open the lobby screen
    When I set AI difficulty to "Hard"
    And I switch to "Multiplayer" mode
    And I switch to "Single Player" mode
    Then the AI difficulty selector should have "Easy" selected

  Scenario: SC-19 - Single-player name is preserved after mode round-trip
    Given I open the lobby screen
    When I type "Carlos" in the single player name
    And I switch to "Multiplayer" mode
    And I switch to "Single Player" mode
    Then single player name should contain "Carlos"

  Scenario: SC-20 - Player-count selector is hidden in Single Player mode
    Given I open the lobby screen
    Then the player-count selector is hidden

  Scenario: SC-21 - Multiplayer player-count selector offers 2 3 and 4
    Given I open the lobby screen
    When I switch to "Multiplayer" mode
    Then the player-count selector should offer "2", "3", and "4"

  Scenario: SC-22 - Multiplayer defaults to 2 players when first activated
    Given I open the lobby screen
    When I switch to "Multiplayer" mode
    Then the player-count selector should offer "2", "3", and "4"
    And I should see 2 multiplayer name fields

  Scenario Outline: SC-23 - Multiplayer visible name fields match selected count
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    When I choose <count> players
    Then I should see <count> multiplayer name fields

    Examples:
      | count |
      | 2     |
      | 3     |
      | 4     |

  Scenario Outline: SC-24 - Multiplayer defaults use Jugador-N naming
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    And I choose <count> players
    Then multiplayer player <position> should contain "<default_name>"

    Examples:
      | count | position | default_name |
      | 2     | 1        | Jugador-1    |
      | 2     | 2        | Jugador-2    |
      | 3     | 3        | Jugador-3    |
      | 4     | 4        | Jugador-4    |

  Scenario: SC-25 - Increasing player count appends default field and preserves prior names
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    And I enter "Ana" in multiplayer player 1
    And I enter "Luis" in multiplayer player 2
    When I choose 3 players
    Then multiplayer player 1 should contain "Ana"
    And multiplayer player 2 should contain "Luis"
    And multiplayer player 3 should contain "Jugador-3"

  Scenario: SC-26 - Decreasing player count removes last field
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    And I choose 3 players
    When I choose 2 players
    Then I should see 2 multiplayer name fields
    And multiplayer player 3 input should not exist

  Scenario: SC-27 - Decreasing player count preserves remaining names
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    And I enter "Ana" in multiplayer player 1
    And I enter "Luis" in multiplayer player 2
    And I choose 3 players
    And I enter "Marta" in multiplayer player 3
    When I choose 2 players
    Then multiplayer player 1 should contain "Ana"
    And multiplayer player 2 should contain "Luis"

  Scenario: SC-28 - Multiplayer names survive switching to Single Player and back
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    And I enter "Ana" in multiplayer player 1
    And I enter "Luis" in multiplayer player 2
    When I switch to "Single Player" mode
    And I switch to "Multiplayer" mode
    Then multiplayer player 1 should contain "Ana"
    And multiplayer player 2 should contain "Luis"

  Scenario: SC-29 - AI difficulty is hidden in Multiplayer mode
    Given I open the lobby screen
    When I switch to "Multiplayer" mode
    Then the AI difficulty selector is hidden

  Scenario: SC-30 - Defaults keep the form valid on load
    Given I open the lobby screen
    Then single player name should contain "Jugador-1"
    And no validation error messages should be visible
    And the "Jugar" button is enabled
    When I switch to "Multiplayer" mode
    Then multiplayer player 1 should contain "Jugador-1"
    And multiplayer player 2 should contain "Jugador-2"

  Scenario: SC-31 - Jugar button is enabled on first load
    Given I open the lobby screen
    Then the "Jugar" button is enabled

  Scenario: SC-32 - Clearing and blurring single-player name shows validation message
    Given I open the lobby screen
    When I clear the single player name and blur the field
    Then I should see a Spanish required-name error

  Scenario: SC-33 - Required-name error text is in Spanish and explicit
    Given I open the lobby screen
    When I clear the single player name and blur the field
    Then I should see a Spanish required-name error
    And the Spanish required-name error should mention "obligatorio"

  Scenario: SC-34 - Validation error clears as user starts typing
    Given I open the lobby screen
    And I clear the single player name and blur the field
    When I type "C" in the single player name
    Then the single player required-name error should not be visible

  Scenario: SC-35 - Whitespace-only name is invalid
    Given I open the lobby screen
    When I type only spaces in the single player name and blur the field
    Then I should see a Spanish required-name error
    And the "Jugar" button is disabled

  Scenario: SC-36 - Jugar button is disabled while any required field is empty
    Given I open the lobby screen
    When I clear the single player name and blur the field
    Then the "Jugar" button is disabled

  Scenario: SC-37 - Jugar button re-enables when empty field is filled again
    Given I open the lobby screen
    And I clear the single player name and blur the field
    And the "Jugar" button is disabled
    When I type "Carlos" in the single player name
    Then the "Jugar" button is enabled

  Scenario: SC-38 - Re-focusing an emptied field does not restore default value
    Given I open the lobby screen
    And I clear the single player name and blur the field
    When I focus the single player name without typing
    Then the single player name field should remain empty
    And I should see a Spanish required-name error

  Scenario: SC-39 - All empty multiplayer names show validation errors
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    And I choose 3 players
    When I clear all three multiplayer player names and blur each field
    Then I should see required-name errors for multiplayer players 1 through 3
    And the "Jugar" button is disabled

  Scenario: SC-40 - Jugar button is visible in setup panel
    Given I open the lobby screen
    Then the "Jugar" button should be visible

  Scenario: SC-41 - Jugar button is visually prominent
    Given I open the lobby screen
    Then the "Jugar" button should be visually prominent

  Scenario: SC-42 - Valid single-player submit starts the game flow
    Given I open the lobby screen
    And the "Single Player" mode is selected
    And single player name should contain "Jugador-1"
    And the AI difficulty selector should have "Easy" selected
    When I press the "Jugar" button
    Then the application should navigate to the game board route

  Scenario: SC-43 - Valid multiplayer submit starts the game flow
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    And I choose 2 players
    And multiplayer player 1 should contain "Jugador-1"
    And multiplayer player 2 should contain "Jugador-2"
    When I press the "Jugar" button
    Then the application should navigate to the game board route

  Scenario: SC-44 - Invalid form cannot navigate away from Lobby
    Given I open the lobby screen
    And I clear the single player name and blur the field
    And the "Jugar" button is disabled
    When I try to press the "Jugar" button
    Then the application should stay on the lobby route

  Scenario: SC-45 - Jugar button pressed feedback is available within 100ms
    Given I open the lobby screen
    When I press and hold the "Jugar" button
    Then pressing and holding "Jugar" should show visual feedback within 100 milliseconds

  Scenario: SC-46 - Mobile viewport has no horizontal overflow
    Given I open the lobby screen on a 320 by 720 viewport
    Then the page should not have horizontal overflow

  Scenario: SC-47 - Mobile viewport stacks hero above setup panel
    Given I open the lobby screen on a 320 by 720 viewport
    Then the hero section should appear above the setup panel

  Scenario: SC-48 - Touch targets are at least 44 by 44
    Given I open the lobby screen on a 320 by 720 viewport
    Then all primary controls should have at least 44 by 44 pixels

  Scenario: SC-49 - Desktop viewport uses horizontal space meaningfully
    Given I open the lobby screen on a 1280 by 800 viewport
    Then the hero and setup sections should be side by side
    And the desktop layout should use meaningful horizontal space

  Scenario: SC-50 - Keyboard reachability includes all critical controls
    Given I open the lobby screen
    When I probe keyboard reachable controls
    Then keyboard reachable controls should include lobby interactive elements
    And no interactive control should be skipped in the keyboard map

  Scenario: SC-51 - Focus order follows visual reading order
    Given I open the lobby screen
    When I capture the focusable controls layout order
    Then focus order should follow top-to-bottom and left-to-right layout

  Scenario: SC-52 - Focused controls provide a visible focus indicator
    Given I open the lobby screen
    When I focus interactive controls for accessibility
    Then focused controls should show a visible focus indicator

  Scenario: SC-53 - Mode and difficulty selectors respond to arrow keys
    Given I open the lobby screen
    When I use arrow keys on mode and difficulty selectors
    Then selector values should change with arrow-key input

  Scenario: SC-54 - Enter and Space on focused Jugar trigger submit when valid
    Given I open the lobby screen
    When I focus the "Jugar" button and press Enter
    Then the application should navigate to the game board route
    Given I open the lobby screen
    When I focus the "Jugar" button and press Space
    Then the application should navigate to the game board route

  Scenario: SC-55 - Enter in a name input does not submit invalid form
    Given I open the lobby screen
    And I switch to "Multiplayer" mode
    And I choose 2 players
    And I clear multiplayer player 2 and blur the field
    When I focus multiplayer player 1 and press Enter
    Then the application should stay on the lobby route

  Scenario: SC-56 - Interactive controls expose accessible labels
    Given I open the lobby screen
    When I inspect interactive control labeling
    Then every interactive control should have an accessible label

  Scenario: SC-57 - Validation error is programmatically associated with input
    Given I open the lobby screen
    When I clear the single player name and blur the field
    Then the single player input should reference its error message
    And a screen reader focused on the input should expose the error description

  Scenario: SC-58 - Text colors satisfy WCAG AA contrast thresholds
    Given I open the lobby screen
    When I measure visible text contrast ratios
    Then all normal-size text should meet at least 4.5 to 1 contrast
    And all large-size text should meet at least 3 to 1 contrast
