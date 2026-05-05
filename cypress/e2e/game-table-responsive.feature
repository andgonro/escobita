Feature: Responsive Usability

  Scenario: SC-24 - table is usable from mobile baseline width
    Given viewport width is 320 pixels
    When the game table is rendered
    Then core zones remain usable
    And primary actions remain reachable

  Scenario Outline: SC-25 - tablet and desktop preserve readability and balance
    Given viewport width is <viewportRange> range
    When the game table is rendered
    Then information hierarchy remains clear
    And card zones do not overlap critical context

    Examples:
      | viewportRange |
      | tablet        |
      | desktop       |
