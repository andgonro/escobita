# BDD Test Scenarios: Game Engine Core

**Source Spec:** `docs/specs/game-engine/core/`  
**Generated from:** proposal.md, spec.md, user-stories.md

> **Clarifications applied before generation:**
>
> - FR-5.8 (two-phase turn model) is authoritative over FR-4.2. Turn does NOT advance automatically after `playCard`; the active player must call `confirmTurn` to advance.
> - FR-7.4 ("no captures all round" fallback) is confirmed out of scope by the product owner — this scenario cannot occur in a valid game.
> - `confirmTurn` called outside the _awaiting confirmation_ sub-state is rejected and a warning is logged, consistent with TR-4.6.

---

## Traceability Matrix

| Scenario ID | Requirement     | User Story  | Category       |
| ----------- | --------------- | ----------- | -------------- |
| SC-01       | FR-1.1, FR-1.3  | US-2        | Happy Path     |
| SC-02       | FR-1.1          | US-2        | Happy Path     |
| SC-03       | FR-1.2          | US-2        | Happy Path     |
| SC-04       | FR-1.2          | US-2        | Edge Case      |
| SC-05       | FR-1.4, TR-2.3  | US-2        | Happy Path     |
| SC-06       | FR-1.3, FR-1.5  | US-2        | Edge Case      |
| SC-07       | FR-1.5          | US-2        | Edge Case      |
| SC-08       | FR-2.1          | US-1        | Happy Path     |
| SC-09       | FR-2.2          | US-1        | Happy Path     |
| SC-10       | FR-2.3          | US-1        | Happy Path     |
| SC-11       | FR-2.1          | US-1        | Happy Path     |
| SC-12       | FR-2.1          | US-1        | Happy Path     |
| SC-13       | FR-2.1          | US-1        | Happy Path     |
| SC-14       | FR-2.2, FR-2.3  | US-1        | Edge Case      |
| SC-15       | FR-2.5          | US-1, US-11 | Happy Path     |
| SC-16       | US-1            | US-1        | Edge Case      |
| SC-17       | FR-2.4          | US-1        | Edge Case      |
| SC-18       | FR-3.1, TR-1.3  | —           | Happy Path     |
| SC-19       | FR-3.2          | US-10       | Happy Path     |
| SC-20       | FR-3.3          | US-10       | Happy Path     |
| SC-21       | FR-4.4, TR-4.3  | US-11       | Happy Path     |
| SC-22       | FR-5.8, TR-4.3  | US-3, US-5  | Happy Path     |
| SC-23       | FR-5.8          | US-3        | Happy Path     |
| SC-24       | FR-4.3          | —           | Edge Case      |
| SC-25       | FR-4.1, FR-5.6  | US-3        | Error          |
| SC-26       | FR-5.8, TR-4.6  | —           | Error          |
| SC-27       | FR-5.8, TR-4.6  | —           | Error          |
| SC-28       | FR-5.3          | US-3        | Happy Path     |
| SC-29       | FR-5.3          | US-3        | Happy Path     |
| SC-30       | FR-5.6, TR-4.6  | US-3        | Error          |
| SC-31       | FR-5.2          | US-3        | Edge Case      |
| SC-32       | FR-5.6, TR-4.6  | US-3        | Error          |
| SC-33       | FR-5.6, TR-4.6  | US-3        | Error          |
| SC-34       | FR-5.6, TR-4.6  | US-3        | Error          |
| SC-35       | FR-5.3, TR-4.3  | US-3, US-11 | Happy Path     |
| SC-36       | FR-5.5          | US-5        | Happy Path     |
| SC-37       | FR-5.7          | US-5        | Happy Path     |
| SC-38       | FR-5.7          | US-5        | Edge Case      |
| SC-39       | FR-5.8          | US-5        | Happy Path     |
| SC-40       | FR-5.4          | US-4        | Happy Path     |
| SC-41       | FR-5.4          | US-4        | Edge Case      |
| SC-42       | FR-5.4          | US-4        | Happy Path     |
| SC-43       | FR-7.3          | US-4        | Edge Case      |
| SC-44       | FR-6.2          | US-6        | Happy Path     |
| SC-45       | FR-6.2          | US-6        | Happy Path     |
| SC-46       | FR-6.3          | US-6        | Edge Case      |
| SC-47       | FR-6.1          | US-6        | Edge Case      |
| SC-48       | FR-7.2          | US-7        | Happy Path     |
| SC-49       | FR-7.3          | US-7        | Happy Path     |
| SC-50       | FR-7.2          | US-7        | Edge Case      |
| SC-51       | FR-8.4          | US-7, US-8  | Happy Path     |
| SC-52       | FR-8.2          | US-8        | Happy Path     |
| SC-53       | FR-8.2          | US-8        | Happy Path     |
| SC-54       | FR-8.2          | US-8        | Edge Case      |
| SC-55       | FR-8.2          | US-8        | Edge Case      |
| SC-56       | FR-8.2          | US-8        | Happy Path     |
| SC-57       | FR-8.2          | US-8        | Edge Case      |
| SC-58       | FR-8.2          | US-8        | Edge Case      |
| SC-59       | FR-8.2          | US-8        | Happy Path     |
| SC-60       | FR-8.2          | US-8        | Edge Case      |
| SC-61       | FR-8.2          | US-8        | Edge Case      |
| SC-62       | FR-8.2          | US-8        | Happy Path     |
| SC-63       | FR-8.3          | US-8        | Happy Path     |
| SC-64       | FR-9.1          | US-9        | Happy Path     |
| SC-65       | FR-9.2          | US-9        | Happy Path     |
| SC-66       | FR-9.3          | US-9        | Edge Case      |
| SC-67       | FR-9.4          | US-9        | Edge Case      |
| SC-68       | FR-9.5          | US-9, US-10 | Error          |
| SC-69       | FR-9.1, TR-4.3  | US-9, US-11 | Happy Path     |
| SC-70       | FR-9.2, TR-4.3  | US-9, US-11 | Happy Path     |
| SC-71       | FR-10.1         | US-10       | Happy Path     |
| SC-72       | FR-10.1         | US-10       | Happy Path     |
| SC-73       | FR-10.1         | US-10       | Happy Path     |
| SC-74       | FR-10.1         | US-10       | Happy Path     |
| SC-75       | FR-10.2         | US-10       | Happy Path     |
| SC-76       | FR-10.3         | US-10       | Happy Path     |
| SC-77       | FR-9.5          | US-9, US-10 | Error          |
| SC-78       | TR-4.3, NFR-2.1 | US-11       | Happy Path     |
| SC-79       | TR-4.3          | US-11       | Happy Path     |
| SC-80       | TR-4.3, FR-5.8  | US-11       | Happy Path     |
| SC-81       | TR-4.3          | US-11       | Happy Path     |
| SC-82       | TR-4.3, FR-8.4  | US-11       | Happy Path     |
| SC-83       | TR-4.3, FR-9.1  | US-11       | Happy Path     |
| SC-84       | TR-4.3, TR-4.5  | US-11       | Happy Path     |
| SC-85       | NFR-2.1, TR-4.3 | US-11       | Non-Functional |

---

## Feature: Deck and Card Representation

Scenario: SC-01 — A complete 40-card deck is generated containing all four suits
When the deck creation function is called
Then the resulting deck contains exactly 40 cards
And the deck includes cards of the suits Oros, Copas, Espadas, and Bastos
And each suit contains exactly 10 cards

Scenario: SC-02 — Each suit contains exactly one card of each rank
When the deck creation function is called
Then each suit contains exactly one card with each of the ranks: 1, 2, 3, 4, 5, 6, 7, Sota, Caballo, and Rey

Scenario Outline: SC-03 — Each card rank carries the correct numeric value
When the deck creation function is called
Then the card with rank <rank> in any suit carries the numeric value <value>

    Examples:
      | rank    | value |
      | 1       | 1     |
      | 2       | 2     |
      | 3       | 3     |
      | 4       | 4     |
      | 5       | 5     |
      | 6       | 6     |
      | 7       | 7     |
      | Sota    | 8     |
      | Caballo | 9     |
      | Rey     | 10    |

Scenario: SC-04 — The sum of all 40 card values in a complete deck equals 220
When the deck creation function is called
Then the sum of the numeric values of all 40 cards equals 220

Scenario: SC-05 — Shuffling a deck returns a new array without mutating the original
Given a freshly created unshuffled deck
When the shuffle function is applied to that deck
Then a new deck array is returned
And the original deck array is not mutated
And the shuffled deck contains the same 40 cards as the original

Scenario: SC-06 — Calling the deck creation function twice produces two independent arrays
When the deck creation function is called twice
Then the two returned arrays are independent objects
And each array contains exactly 40 cards with matching suits, ranks, and numeric values

Scenario: SC-07 — A card's suit, rank, and numeric value do not change after it is created
Given a card has been created with a specific suit, rank, and numeric value
Then the card's suit remains the same at any later point in the game
And the card's rank remains the same at any later point in the game
And the card's numeric value remains the same at any later point in the game

---

## Feature: Game Initialisation

Background:
Given the game engine service is available
And a valid GameConfiguration exists with 2 players named "Alice" and "Bob"

Scenario: SC-08 — initGame creates a full game state with a shuffled deck
When initGame is called with the valid configuration
Then the game state is created
And the remaining deck contains the full 40 cards minus the table and player hand cards
And the deck cards are in a shuffled order

Scenario: SC-09 — The table starts with exactly 4 cards drawn from the deck
When initGame is called with the valid configuration
Then the table contains exactly 4 cards
And those 4 cards are no longer in the remaining deck

Scenario: SC-10 — Each player starts with exactly 3 cards in their hand
When initGame is called with the valid configuration
Then "Alice" has exactly 3 cards in her hand
And "Bob" has exactly 3 cards in his hand
And those cards are drawn from the deck after the 4 table cards

Scenario: SC-11 — All players start with empty captured piles and zero escobas
When initGame is called with the valid configuration
Then "Alice"'s captured pile is empty and her escoba count is 0
And "Bob"'s captured pile is empty and his escoba count is 0

Scenario: SC-12 — All players start with an accumulated match score of zero
When initGame is called with the valid configuration
Then "Alice"'s accumulated match score is 0
And "Bob"'s accumulated match score is 0

Scenario: SC-13 — The active turn is set to the first player and the turn phase is awaiting card play
When initGame is called with the valid configuration
Then the active player is "Alice"
And the turn phase is "awaiting card play"

Scenario: SC-14 — The total number of cards accounted for after initialisation equals 40
When initGame is called with the valid configuration
Then the count of table cards plus all players' hand cards plus remaining deck cards equals 40

Scenario: SC-15 — The game state signal is immediately non-null and readable after initGame
When initGame is called with the valid configuration
Then the game state signal exposes a non-null GameState
And the game state signal is readable without performing any additional action

Scenario: SC-16 — Calling initGame a second time resets all match state completely
Given initGame has already been called once and a game is in progress
When initGame is called again with a new valid configuration
Then all previous player hands, captured piles, and scores are cleared
And the game state reflects only the new configuration
And no data from the previous match persists in any signal

Scenario: SC-17 — Initial table cards that happen to sum to 15 do not trigger an escoba
Given a deck is arranged so that the first 4 cards drawn for the table sum to exactly 15
When initGame is called with that deck
Then no player has an escoba count greater than 0
And the initial 4-card table deal completes normally

---

## Feature: Player Entity State

Background:
Given a game has been initialised with 2 players named "Alice" and "Bob"

Scenario: SC-18 — Each player entity contains all required fields
Then each player entity has a unique identifier
And each player entity has a display name matching the name provided in the configuration
And each player entity has a hand array, a captured pile array, and a numeric escoba count

Scenario: SC-19 — Round-specific player fields are reset at the start of a new round
Given the current round has ended with "Alice" holding 2 escobas and 12 captured cards
When a new round is started
Then "Alice"'s hand is replaced with the 3 newly dealt cards
And "Alice"'s captured pile is empty
And "Alice"'s escoba count is 0

Scenario: SC-20 — Accumulated match score persists unchanged across round boundaries
Given "Alice" has an accumulated match score of 5 at the end of the first round
When a new round is started
Then "Alice"'s accumulated match score is still 5
And it is not reset to zero

---

## Feature: Turn Management and Two-Phase Turn

Background:
Given a game has been initialised with 3 players: "Alice", "Bob", and "Carol"
And it is "Alice"'s turn in the "awaiting card play" phase

Scenario: SC-21 — The active player signal reflects the player whose turn it currently is
Then the active player signal returns "Alice"

Scenario: SC-22 — The turn phase changes to awaiting-confirmation after a card is played
When "Alice" plays a card from her hand with an empty capture subset
Then the turn phase signal changes to "awaiting confirmation"
And the active player signal still shows "Alice"

Scenario: SC-23 — The turn advances to the next player only after confirmTurn is called
Given "Alice" has played a card and the turn phase is "awaiting confirmation"
When "Alice" calls confirmTurn
Then the active player advances to "Bob"
And the turn phase changes to "awaiting card play"

Scenario: SC-24 — Turn order is circular — after the last player it wraps back to the first
Given the active player is "Carol" and the turn phase is "awaiting confirmation"
When "Carol" calls confirmTurn
Then the active player advances to "Alice"
And the turn phase is "awaiting card play"

Scenario: SC-25 — A non-active player attempting to play a card is rejected
When "Bob" attempts to play a card while it is "Alice"'s turn
Then the play is rejected
And the game state is unchanged
And a warning is logged

Scenario: SC-26 — confirmTurn called while the engine is in the awaiting-card-play phase is rejected
Given the turn phase is "awaiting card play" for "Alice"
When "Alice" calls confirmTurn without having played a card first
Then the call is rejected
And the game state is unchanged
And a warning is logged

Scenario: SC-27 — confirmTurn called a second time after the turn has already advanced is rejected
Given "Alice" has played a card and the turn phase is "awaiting confirmation"
And "Alice" calls confirmTurn, advancing the turn to "Bob"
When "Alice" calls confirmTurn again
Then the second call is rejected
And the game state is unchanged
And a warning is logged

---

## Feature: Playing a Card — Capture

Background:
Given a game has been initialised with 2 players: "Alice" and "Bob"
And it is "Alice"'s turn in the "awaiting card play" phase

Scenario: SC-28 — A valid capture removes the played card from the active player's hand
Given "Alice"'s hand contains a card with value 8
And the table contains a card with value 7
When "Alice" plays the card with value 8 specifying the card with value 7 as the capture subset
Then "Alice"'s hand no longer contains the card with value 8

Scenario: SC-29 — A valid capture adds the played card and all captured table cards to the player's captured pile
Given "Alice"'s hand contains a card with value 8
And the table contains a card with value 7
When "Alice" plays the card with value 8 specifying the card with value 7 as the capture subset
Then "Alice"'s captured pile contains the played card with value 8
And "Alice"'s captured pile contains the captured card with value 7
And the card with value 7 is no longer on the table

Scenario: SC-30 — A capture subset whose sum plus the played card does not equal 15 is rejected
Given "Alice"'s hand contains a card with value 3
And the table contains a card with value 5 and a card with value 6
When "Alice" plays the card with value 3 specifying only the card with value 5 as the capture subset
Then the play is rejected because 3 plus 5 does not equal 15
And the game state is unchanged
And a warning is logged

Scenario: SC-31 — When multiple valid capture subsets exist the player's explicit choice determines what is captured
Given "Alice"'s hand contains a card with value 8
And the table contains a card with value 7, a card with value 2, and a card with value 5
And both a single-card subset (value 7) and a two-card subset (values 2 and 5) sum to 7, making both valid with the played card
When "Alice" plays the card with value 8 specifying only the card with value 7 as the capture subset
Then only the card with value 7 is removed from the table
And the cards with values 2 and 5 remain on the table
And "Alice"'s captured pile contains only the played card and the card with value 7

Scenario: SC-32 — Attempting to play a card not in the active player's hand is rejected
Given "Alice"'s hand does not contain a 7 of Oros
When "Alice" attempts to play the 7 of Oros
Then the play is rejected
And the game state is unchanged
And a warning is logged

Scenario: SC-33 — A capture subset containing a card not present on the table is rejected
Given "Alice"'s hand contains a card with value 8
And the table contains only the 7 of Copas
When "Alice" plays the card with value 8 specifying the 7 of Oros as the capture subset, which is not on the table
Then the play is rejected
And the game state is unchanged
And a warning is logged

Scenario: SC-34 — A valid capture leaves the engine in the awaiting-confirmation phase
Given "Alice"'s hand contains a card with value 10
And the table contains a card with value 5
When "Alice" plays the card with value 10 specifying the card with value 5 as the capture subset
Then the turn phase changes to "awaiting confirmation"
And the active player signal still shows "Alice"

Scenario: SC-35 — All relevant signals are updated to reflect the new state after a valid capture
Given "Alice"'s hand contains a card with value 10
And the table contains a card with value 5
When "Alice" plays the card with value 10 specifying the card with value 5 as the capture subset
Then the game state signal reflects "Alice"'s updated hand
And the game state signal reflects the updated table
And the game state signal reflects "Alice"'s updated captured pile

---

## Feature: Playing a Card — Table Placement

Background:
Given a game has been initialised with 2 players: "Alice" and "Bob"
And it is "Alice"'s turn in the "awaiting card play" phase

Scenario: SC-36 — Playing a card with an empty capture subset places the card on the table
Given "Alice"'s hand contains a card with value 4
When "Alice" plays the card with value 4 with an empty capture subset
Then the card with value 4 is added to the table
And "Alice"'s hand no longer contains that card
And no cards are added to "Alice"'s captured pile
And "Alice"'s escoba count remains unchanged

Scenario: SC-37 — A player may choose to place a card on the table even when a valid capture exists
Given "Alice"'s hand contains a card with value 8
And the table contains a card with value 7
And the combination 8 plus 7 constitutes a valid capture
When "Alice" plays the card with value 8 with an empty capture subset
Then the card with value 8 is added to the table
And "Alice"'s captured pile remains unchanged

Scenario: SC-38 — A missed capture opportunity is permanent after a table placement is finalised
Given "Alice" has just placed a card on the table with an empty capture subset
And a valid capture was available on the table at the time of that play
Then the capture opportunity is permanently lost for that turn
And the game state after the placement remains as committed with no retroactive correction possible

Scenario: SC-39 — The turn phase changes to awaiting-confirmation after a table placement
Given "Alice"'s hand contains a card with value 2
When "Alice" plays the card with value 2 with an empty capture subset
Then the turn phase changes to "awaiting confirmation"
And the active player signal still shows "Alice"

---

## Feature: Escoba Detection

Background:
Given a game has been initialised with 2 players: "Alice" and "Bob"
And it is "Alice"'s turn in the "awaiting card play" phase

Scenario: SC-40 — Capturing all table cards records one escoba for the active player
Given "Alice"'s hand contains a card with value 8
And the table contains only a card with value 7
When "Alice" plays the card with value 8 specifying the card with value 7 as the capture subset
Then the table is empty after the capture
And "Alice"'s escoba count for the current round is incremented by 1

Scenario: SC-41 — Multiple escobas in the same round accumulate independently
Given "Alice" already has 1 escoba recorded in the current round
And "Alice"'s hand contains a card with value 6
And the table contains only a card with value 9
When "Alice" plays the card with value 6 specifying the card with value 9 as the capture subset
Then the table is empty after the capture
And "Alice"'s escoba count for the current round is 2

Scenario: SC-42 — A capture that does not clear the entire table does not record an escoba
Given "Alice"'s hand contains a card with value 5
And the table contains a card with value 10 and a card with value 3
When "Alice" plays the card with value 5 specifying the card with value 10 as the capture subset
Then the table still contains the card with value 3
And "Alice"'s escoba count remains unchanged

Scenario: SC-43 — Awarding remaining table cards at end of round does not record an escoba
Given the round is ending and 3 cards remain on the table
And "Alice" was the last player to make a capture during the round
When the engine awards the remaining 3 table cards to "Alice"
Then those cards are added to "Alice"'s captured pile
And "Alice"'s escoba count is not incremented

---

## Feature: End of Hand — Dealing the Next Batch

Background:
Given a game has been initialised with 2 players: "Alice" and "Bob"

Scenario: SC-44 — The engine auto-deals 3 cards per player when all hands become empty and the deck has cards
Given all players' hands are empty
And the deck still contains at least 6 cards
When the condition of all hands being empty is detected
Then the engine automatically deals exactly 3 cards to "Alice"
And the engine automatically deals exactly 3 cards to "Bob"
And the remaining deck is reduced by 6 cards

Scenario: SC-45 — No new cards are added to the table between hand deals
Given all players' hands are empty
And the deck contains cards
When the engine deals the next batch of hand cards
Then the number of cards on the table is unchanged from before the deal

Scenario: SC-46 — When the deck has fewer cards than required the remaining cards go to earlier players first
Given all players' hands are empty
And the deck contains exactly 5 cards
When the engine deals the next batch of hand cards
Then "Alice" (first player in turn order) receives 3 cards
And "Bob" (second player in turn order) receives 2 cards

Scenario: SC-47 — When the deck is empty after all hands become empty end-of-round resolution begins
Given all players' hands are empty
And the deck contains no remaining cards
When the condition of all hands being empty is detected
Then no further card dealing occurs
And the engine begins end-of-round resolution

---

## Feature: End of Round — Remaining Table Card Resolution

Background:
Given a game has been initialised with 2 players: "Alice" and "Bob"
And the deck is exhausted and all players' hands are empty

Scenario: SC-48 — All remaining table cards are awarded to the last player who made a capture
Given 3 cards remain on the table
And "Alice" was the last player to successfully make a capture during the round
When end-of-round resolution is triggered
Then all 3 remaining table cards are added to "Alice"'s captured pile
And the table is empty

Scenario: SC-49 — Awarding remaining table cards at round end does not count as an escoba
Given 2 cards remain on the table
And "Bob" was the last player to make a capture during the round
When end-of-round resolution awards the remaining table cards to "Bob"
Then "Bob"'s escoba count is not incremented

Scenario: SC-50 — All 40 cards are distributed among players' captured piles after round end resolution
Given end-of-round table card resolution has completed
Then the sum of all cards across all players' captured piles equals 40
And the table is empty

Scenario: SC-51 — The RoundResult signal is updated after round end resolution completes
When end-of-round resolution completes
Then the round result signal changes from null to a non-null RoundResult
And the RoundResult includes a points breakdown for each player per scoring category

---

## Feature: Round Scoring

Rule: Escoba category scoring

    Scenario: SC-52 — Each escoba earned by a player during the round awards 1 point to their round score
      Given "Alice" made 3 escobas during the round
      And "Bob" made 1 escoba during the round
      When round scores are calculated at end of round
      Then "Alice" earns 3 points from the escoba category
      And "Bob" earns 1 point from the escoba category

Rule: Most-cards category scoring

    Scenario: SC-53 — The player who captured strictly the most cards earns 1 point
      Given "Alice" captured 22 cards and "Bob" captured 18 cards
      When round scores are calculated at end of round
      Then "Alice" earns 1 point from the most-cards category
      And "Bob" earns 0 points from the most-cards category

    Scenario: SC-54 — A tie in the most-cards category means no player receives that point
      Given "Alice" captured 20 cards and "Bob" captured 20 cards
      When round scores are calculated at end of round
      Then neither "Alice" nor "Bob" earns a point from the most-cards category

    Scenario: SC-55 — Capturing all 40 cards earns 2 points for the most-cards category
      Given "Alice" captured all 40 cards
      And "Bob" captured 0 cards
      When round scores are calculated at end of round
      Then "Alice" earns 2 points from the most-cards category

Rule: Most-Oros category scoring

    Scenario: SC-56 — The player who captured strictly the most Oros cards earns 1 point
      Given "Alice" captured 6 Oros cards and "Bob" captured 4 Oros cards
      When round scores are calculated at end of round
      Then "Alice" earns 1 point from the most-oros category
      And "Bob" earns 0 points from the most-oros category

    Scenario: SC-57 — Capturing all 10 Oros cards earns 2 points for the most-Oros category
      Given "Alice" captured all 10 Oros cards
      When round scores are calculated at end of round
      Then "Alice" earns 2 points from the most-oros category

    Scenario: SC-58 — A tie in the most-Oros category means no player receives that point
      Given "Alice" captured 5 Oros cards and "Bob" captured 5 Oros cards
      When round scores are calculated at end of round
      Then neither "Alice" nor "Bob" earns a point from the most-oros category

Rule: Most-sevens category scoring

    Scenario: SC-59 — The player who captured strictly the most sevens earns 1 point
      Given "Alice" captured 3 sevens and "Bob" captured 1 seven
      When round scores are calculated at end of round
      Then "Alice" earns 1 point from the most-sevens category
      And "Bob" earns 0 points from the most-sevens category

    Scenario: SC-60 — Capturing all 4 sevens earns 2 points for the most-sevens category
      Given "Alice" captured all 4 sevens, one from each suit
      When round scores are calculated at end of round
      Then "Alice" earns 2 points from the most-sevens category

    Scenario: SC-61 — A tie in the most-sevens category means no player receives that point
      Given "Alice" captured 2 sevens and "Bob" captured 2 sevens
      When round scores are calculated at end of round
      Then neither "Alice" nor "Bob" earns a point from the most-sevens category

Rule: Siete de Velo (7 of Oros) and accumulated scores

    Scenario: SC-62 — The player who captured the 7 of Oros earns 1 additional point independently
      Given "Alice" captured the 7 of Oros during the round
      When round scores are calculated at end of round
      Then "Alice" earns 1 point from the siete-de-velo category
      And this point is awarded regardless of "Alice"'s standing in the most-oros and most-sevens categories

    Scenario: SC-63 — Round points are added directly to each player's accumulated match score
      Given "Alice" has an accumulated match score of 3 before the current round ends
      And "Alice" earns 4 points in the current round across all scoring categories
      When round scores are applied
      Then "Alice"'s accumulated match score becomes 7

---

## Feature: Win Condition and Match End

Background:
Given a match is in progress with 2 players: "Alice" and "Bob"
And the match-winner signal is null

Scenario: SC-64 — No winner is declared while all players remain below 15 accumulated points
Given "Alice" has an accumulated match score of 8
And "Bob" has an accumulated match score of 6
When round scores are applied and no player reaches 15 points
Then the match-winner signal remains null
And a new round can be started

Scenario: SC-65 — A player who reaches 15 or more accumulated points is declared the match winner
Given "Alice" has an accumulated match score of 13
And "Bob" has an accumulated match score of 10
And "Alice" earns 3 points in the current round bringing her total to 16
When round scores are applied
Then the match-winner signal is updated to identify "Alice" as the winner
And no further rounds can be started

Scenario: SC-66 — When multiple players reach 15 simultaneously the player with the highest score wins
Given "Alice" has an accumulated match score of 14
And "Bob" has an accumulated match score of 14
And at end of round "Alice" earns 2 points (total 16) and "Bob" earns 1 point (total 15)
When round scores are applied
Then the match-winner signal is updated to identify "Alice" as the winner

Scenario: SC-67 — When multiple players reach 15 simultaneously with equal scores no winner is declared and play continues
Given "Alice" has an accumulated match score of 14
And "Bob" has an accumulated match score of 14
And both "Alice" and "Bob" each earn 2 points in the current round bringing both to 16
When round scores are applied
Then both players have an accumulated score of 16
And the match-winner signal remains null
And a new round can be started

Scenario: SC-68 — startNextRound is rejected if a match winner has already been declared
Given "Alice" has been declared the match winner
When startNextRound is called
Then the call is rejected
And the game state is unchanged
And a warning is logged

Scenario: SC-69 — The match-winner signal is null throughout an ongoing match
Given no player has reached 15 or more accumulated points
Then the match-winner signal is null

Scenario: SC-70 — The match-winner signal becomes non-null once a winner is determined
Given "Alice" reaches 15 or more accumulated points and is declared the winner
Then the match-winner signal is updated to "Alice"'s player identity
And it remains non-null for the rest of the session

---

## Feature: New Round Initialisation

Background:
Given a match is in progress with 2 players: "Alice" and "Bob"
And the current round has ended
And no match winner has been declared

Scenario: SC-71 — startNextRound creates a freshly shuffled 40-card deck
When startNextRound is called
Then the deck is a complete 40-card deck in a shuffled order
And it is independent from the deck used in the previous round

Scenario: SC-72 — startNextRound resets all players' round-specific state
Given "Alice" ended the previous round with 2 escobas and 20 captured cards
When startNextRound is called
Then "Alice"'s captured pile is empty
And "Alice"'s escoba count is 0
And "Bob"'s captured pile is empty
And "Bob"'s escoba count is 0

Scenario: SC-73 — startNextRound deals 4 initial table cards and 3 hand cards per player
When startNextRound is called
Then the table contains exactly 4 cards
And "Alice" has exactly 3 cards in her hand
And "Bob" has exactly 3 cards in his hand

Scenario: SC-74 — The round number increments by 1 when a new round starts
Given the current round number is 2
When startNextRound is called
Then the round number is 3

Scenario: SC-75 — The dealer role rotates by one player position at the start of each new round
Given "Alice" was the first player in the previous round
When startNextRound is called
Then "Bob" becomes the first player (dealer) in the new round
And turn order starts from "Bob"

Scenario: SC-76 — Accumulated match scores are preserved when a new round starts
Given "Alice" has an accumulated match score of 8
And "Bob" has an accumulated match score of 6
When startNextRound is called
Then "Alice"'s accumulated match score is still 8
And "Bob"'s accumulated match score is still 6

Scenario: SC-77 — startNextRound is rejected when a match winner already exists
Given "Alice" has been declared the match winner
When startNextRound is called
Then the call is rejected
And the match winner remains "Alice"
And the game state is unchanged
And a warning is logged

---

## Feature: Reactive State Signals

Background:
Given the game engine service is available
And a game has been initialised with 2 players: "Alice" and "Bob"

Scenario: SC-78 — The game state signal exposes a non-null, complete GameState snapshot after initialisation
Then the game state signal returns a non-null GameState
And the GameState includes the deck, table, player list, turn index, round number, match scores, and last capturer identity

Scenario: SC-79 — The active player signal is computed from the current game state and updates when the turn advances
Then the active player signal returns the player entity matching the current turn index
When "Alice" plays a card and calls confirmTurn
Then the active player signal returns "Bob"

Scenario: SC-80 — The turn phase signal reflects the current sub-state of the active turn
Given the turn phase is "awaiting card play"
Then the turn phase signal returns "awaiting card play"
When "Alice" plays a card from her hand
Then the turn phase signal returns "awaiting confirmation"
When "Alice" calls confirmTurn
Then the turn phase signal returns "awaiting card play"

Scenario: SC-81 — The round result signal is null while a round is in progress
Given a round is in progress and has not yet ended
Then the round result signal is null

Scenario: SC-82 — The round result signal is updated to a non-null RoundResult after a round completes
Given a round has just ended and end-of-round scoring has been applied
Then the round result signal is non-null
And it contains a per-category points breakdown for each player

Scenario: SC-83 — The match winner signal is null during an ongoing match
Given no player has reached 15 or more accumulated points
Then the match winner signal is null

Scenario: SC-84 — Every state-changing action produces a new detectable signal value
Given the game engine is in a known state before "Alice" plays a card
When "Alice" plays a valid card
Then the game state signal emits a new value that differs from the previous value
When "Alice" calls confirmTurn
Then the game state signal emits a new value reflecting the advanced turn
When a round ends and startNextRound is called
Then the game state signal emits a new value reflecting the new round state

Scenario: SC-85 — All signals exposed by the game engine are read-only to external consumers
Then the game state signal does not expose a public setter to consumers
And the active player signal does not expose a public setter to consumers
And the turn phase signal does not expose a public setter to consumers
And the round result signal does not expose a public setter to consumers
And the match winner signal does not expose a public setter to consumers
