Feature: Zone Animation Metadata Integration

  Scenario: SC-01/SC-04/SC-12 - zone visuals consume animation metadata consistently
    Given a single player game has been started for zone animation metadata checks
    When the capture fixture is applied for zone animation metadata checks
    Then hand cards show play or deal animation classes
    Then table cards show capture animation classes
    And opponent cards show opponent animation classes
