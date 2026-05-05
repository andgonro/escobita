Feature: Turn Completion and Handoff

  Scenario: SC-16 - handoff toggle is available in multiplayer
    Given the match mode is multiplayer
    When game table controls are displayed
    Then handoff toggle is visible and operable

  Scenario: SC-17 - handoff overlay appears when enabled
    Given handoff toggle is enabled in multiplayer
    When turn completion occurs
    Then handoff overlay is displayed before next-turn reveal

  Scenario: SC-18 - direct transition occurs when handoff is disabled
    Given handoff toggle is disabled in multiplayer
    When turn completion occurs
    Then next-turn view appears without handoff overlay

  Scenario: SC-19 - handoff behavior is bypassed in single-player
    Given the match mode is single-player
    When turn completion occurs
    Then handoff overlay is not shown
