Feature: Engine Integration

  Scenario: SC-26 - UI reflects engine signal updates
    Given game-engine signals change after an action
    When the table re-renders
    Then visible state is synchronized with engine outputs

  Scenario: SC-15 - table clear capture reflects escoba outcome
    Given engine provides a table-clearing escoba state
    When table context is rendered
    Then escoba outcome is visible in game state context

  Scenario: SC-29 - round and winner states are displayed from engine outcomes
    Given engine provides round-result or winner state
    When table context is rendered
    Then round and winner outcomes are visible without rule duplication in UI