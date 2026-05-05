Feature: Turn Completion and Handoff Consistency

  Scenario: SC-30 - enabled handoff remains consistent across subsequent turns
    Given handoff toggle is enabled in multiplayer
    When turn completion occurs twice in the same match
    Then active player advances on each completion
    And handoff branch behavior remains enabled across both completions

  Scenario: SC-30 - disabled handoff remains consistent across subsequent turns
    Given handoff toggle is disabled in multiplayer
    When turn completion occurs twice in the same match
    Then active player advances on each completion
    And handoff branch behavior remains disabled across both completions

  Scenario: SC-30 - in-session handoff mode change applies on the immediate next completion
    Given handoff toggle is enabled in multiplayer
    When one turn completion occurs with handoff enabled
    And handoff mode is switched to disabled in the same match
    And the next turn completion occurs
    Then first completion uses enabled handoff branch
    And second completion uses disabled handoff branch
    And active player advances on each completion