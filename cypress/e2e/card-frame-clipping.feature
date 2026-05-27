Feature: Card Frame Clipping Fix

  # Covers: SC-01, SC-04, SC-05, SC-08

  Background:
    Given a single-player game is active on the game table

  # Proxy test for FR-1 artwork visibility (full visual QA deferred to T-3).
  # Overflow property removal is the CSS mechanism that unblocks card rendering beyond the button boundary.
  Scenario: SC-01 — Hand card button does not clip overflow at rest on a mobile viewport
    Given the viewport is set to a representative mobile portrait size
    When the active hand zone is displayed in the idle state
    Then the hand card button computed overflow is not hidden

  Scenario: SC-04 — Hand card slot interactive area is unchanged after overflow is permitted
    When the active hand zone is displayed in the idle state
    Then each hand card button meets the minimum touch target size

  # Proxy test for FR-2 artwork visibility (full visual QA deferred to T-4).
  # Overflow property removal is the CSS mechanism that unblocks card rendering beyond the button boundary.
  Scenario: SC-05 — Table card button does not clip overflow at rest on a mobile viewport
    Given the viewport is set to a representative mobile portrait size
    When the center table zone is displayed in the idle state
    Then the table card button computed overflow is not hidden

  Scenario: SC-08 — Table card slot interactive area is unchanged after overflow is permitted
    When the center table zone is displayed in the idle state
    Then each table card button meets the minimum touch target size
