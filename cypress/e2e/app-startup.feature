Feature: Application Startup

  Scenario: The app loads successfully
    Given the application is running
    When I visit the home page
    Then I should see the application title
