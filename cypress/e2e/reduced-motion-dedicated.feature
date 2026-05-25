Feature: Reduced-motion dedicated animation paths

  # Covers: SC-03, SC-06, SC-09, SC-13

  Scenario: SC-03 - reduced-motion removes play motion while preserving placement outcome
    Given reduced-motion single-player mode is active for dedicated path checks
    When a reduced-motion non-capture play action is submitted
    Then play motion classes are not applied
    And placement outcome matches expected game state change

  Scenario: SC-06 - reduced-motion removes capture glow and fade timing
    Given reduced-motion single-player mode is active for dedicated path checks
    When a reduced-motion legal capture action is submitted
    Then capture motion classes are not applied
    And captured cards are removed with correct state outcome

  Scenario: SC-09 - reduced-motion makes hand replenishment outcomes immediate
    Given reduced-motion single-player mode is active for dedicated path checks
    When reduced-motion turn confirmation advances to the next interaction phase
    Then deal motion classes are not applied
    And hand interaction remains available after confirmation

  Scenario: SC-13 - reduced-motion removes AI motion while preserving readable turn outcome
    Given reduced-motion single-player mode is active for dedicated path checks
    When reduced-motion AI turn fixture is applied
    Then opponent motion classes are not applied
    And AI outcome remains readable for the player
