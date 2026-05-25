Feature: Animation state isolation and interruption recovery

  # Covers: SC-20, SC-21

  Scenario: SC-20 - animation state updates do not alter engine rule outcomes
    Given a single-player game is ready for animation isolation checks
    When an animation-heavy fixture is applied for isolation checks
    Then engine state summary remains stable while animation metadata is present
    And animation metadata is visible without changing rule outcomes

  Scenario: SC-21 - animation interruption preserves a consistent legal state
    Given a single-player game is ready for animation isolation checks
    And an animation-heavy fixture is applied for isolation checks
    When interruption recovery is triggered for completion handling
    Then turn sequencing reports recovered state
    And engine state remains legal with no orphaned visible card identities
