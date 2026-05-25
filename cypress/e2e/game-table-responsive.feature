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

  Scenario Outline: SC-22 - card movement remains geometrically coherent per viewport profile
    Given viewport width is <viewportRange> range
    When the player submits a play action to trigger card movement animation
    Then the played card remains within the center table bounds

    Examples:
      | viewportRange |
      | mobile        |
      | tablet        |
      | desktop       |

  Scenario: SC-23 - fallback progression remains valid when movement coordinate resolution fails
    Given viewport width is mobile range
    And coordinate resolution is forced to fail for animated cards
    When the player submits a play action to trigger card movement animation
    Then fallback path keeps action progression valid

  Scenario: SC-24 - animation sequencing remains smooth under repeated mobile submissions
    Given viewport width is mobile range
    When repeated play submissions are executed for animation cadence
    Then animated card visuals rely on transform or opacity driven states
