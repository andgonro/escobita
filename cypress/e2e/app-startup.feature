Feature: Application Startup

  Scenario: Lobby is the first screen at root URL
    Given I open the application root URL
    Then I should see the lobby heading
    And the URL should remain on the lobby route
