# User Stories: Game Table MVP

## US-1: See the Play Table Clearly

As a player
I want a clear game table layout with my hand, table cards, and opponent zones
So that I can immediately understand where to act on my turn

Acceptance Criteria

- [ ] The active player hand appears in the primary bottom zone.
- [ ] Table cards appear in a central play zone.
- [ ] Opponent zones are visible and adapt to player count.
- [ ] The table uses a textured surface with readability-preserving overlay.
- [ ] Visual density remains readable on mobile and desktop.

## US-2: Track Turn and Match Context at All Times

As a player
I want to always see turn and score context
So that I can make decisions without opening extra panels

Acceptance Criteria

- [ ] Active player indicator is always visible.
- [ ] Match scores for all players are always visible.
- [ ] Current turn phase is always visible.
- [ ] Context indicators update after each confirmed action.
- [ ] Context remains readable when handoff mode is enabled.

## US-3: Select and Confirm a Card Play

As the active player
I want to select a card and explicitly confirm play
So that I avoid accidental actions and stay aligned with turn flow

Acceptance Criteria

- [ ] Only active-player cards are interactive.
- [ ] Selecting a hand card creates clear selected-state feedback.
- [ ] Submitting with no selected hand card is blocked.
- [ ] A confirmed submission executes the play action.
- [ ] After submission, turn completion remains a separate step.

## US-4: Select Capture Subset in MVP

As the active player
I want to select table cards for capture before confirming
So that I can perform full legal captures directly on the table screen

Acceptance Criteria

- [ ] One or more table cards can be selected as a capture subset.
- [ ] Selection validity feedback is shown before submission.
- [ ] Invalid capture combinations are blocked with clear feedback.
- [ ] Empty subset submission is treated as table placement.
- [ ] If capture clears the table, resulting escoba state is visible.
- [ ] If player submits empty subset while a capture was available, missed-capture behavior is preserved.

## US-5: Complete Turn and Pass Device in Multiplayer

As a local multiplayer player
I want configurable handoff behavior between turns
So that device passing can be private when needed and faster when not

Acceptance Criteria

- [ ] Turn completion action is available after play submission.
- [ ] A handoff toggle is available for local multiplayer.
- [ ] When enabled, handoff screen appears before the next turn is revealed.
- [ ] When disabled, turn advances directly.
- [ ] Handoff mode does not interfere with single-player flow.
- [ ] Handoff toggle behavior remains consistent for subsequent turns in the current match.

## US-6: Play with Keyboard and Screen Reader

As a player using assistive technology
I want full keyboard and screen-reader support on the table
So that I can play without mouse-only or visual-only dependence

Acceptance Criteria

- [ ] Core controls are reachable and operable by keyboard.
- [ ] Card controls expose meaningful labels and selected-state context.
- [ ] Invalid action feedback is announced to assistive technology.
- [ ] Turn changes and phase changes are announced.
- [ ] Focus is moved predictably after submission and turn completion.

## US-7: Use the Table Comfortably on Mobile

As a mobile player
I want the game table to remain usable on small screens
So that I can play without layout breakage or tiny touch controls

Acceptance Criteria

- [ ] Table is usable from 320-pixel width.
- [ ] Core controls maintain touch-friendly target size.
- [ ] Card and context zones remain legible without horizontal breakage.
- [ ] Selection and confirmation actions remain clear on compact layouts.
- [ ] Multiplayer handoff experience remains readable on mobile.

## US-8: Trust Engine-Driven Outcomes

As a player
I want table outcomes to match the established game rules
So that UI behavior is consistent with engine-authoritative gameplay

Acceptance Criteria

- [ ] The table UI uses existing engine outcomes for scoring and winner states.
- [ ] The table UI does not implement duplicate scoring logic.
- [ ] Invalid play outcomes are handled through engine-authoritative state updates.
