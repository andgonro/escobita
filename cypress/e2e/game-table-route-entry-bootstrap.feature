Feature: Route and Table Entry

  Scenario: SC-01 - partida route opens a playable table view
    Given a valid game session configuration exists
    When the user navigates to the partida route
    Then the game table screen is displayed
    And the old placeholder view is not displayed