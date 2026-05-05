Feature: Route and Table Entry

  Scenario: SC-02 - active hand and center table zones are visible
    Given I open the game table route in a 2-player multiplayer setup
    When the initial table entry layout is rendered
    Then the active hand zone is shown at the bottom
    And the center table zone is visible

  Scenario Outline: SC-03 - opponent zones adapt to player count
    Given I open the game table route in a <players>-player multiplayer setup
    When the initial table entry layout is rendered
    Then exactly <opponents> opponent zones are shown
    And opponent zones are arranged around the table

    Examples:
      | players | opponents |
      | 2       | 1         |
      | 3       | 2         |
      | 4       | 3         |

  Scenario: SC-04 - textured table surface preserves readability
    Given I open the game table route in a 2-player multiplayer setup
    When the initial table entry layout is rendered
    Then the table surface uses the textured asset with readability overlay
    And text and controls remain readable over the surface

  Scenario: SC-05 - active player, scores, and turn phase are always visible
    Given I open the game table route in a 2-player multiplayer setup
    When I complete a confirmed multiplayer turn transition
    Then active player indicator remains visible
    And match scores remain visible
    And turn phase indicator remains visible

  Scenario: SC-06 - context indicators update after state changes
    Given I open the game table route in a 2-player multiplayer setup
    When I submit and confirm a multiplayer turn with handoff disabled
    Then active player indicator updates after state change
    And turn phase indicator updates after state change
