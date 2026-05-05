Feature: Accessibility Baseline

  Scenario: SC-20 - full keyboard flow supports core actions
    Given keyboard-only navigation is used
    When the user performs select submit and confirm actions
    Then all core actions are operable without pointer input

  Scenario: SC-21 - cards and controls expose accessible labels and selected state
    Given assistive technology is active
    When focus moves through interactive cards and controls
    Then each interactive element has a meaningful label
    And selected-state is programmatically exposed

  Scenario: SC-22 - invalid action and turn-change announcements are available
    Given assistive technology is active
    When invalid submission occurs or turn changes
    Then announcement messages are exposed through live regions

  Scenario: SC-23 - focus transitions are deterministic after key actions
    Given keyboard-only navigation is used
    When submit confirm or handoff acknowledgement occurs
    Then focus moves to the expected next control without ambiguity
