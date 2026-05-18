# Title: Proposal - Card Animation System

## Summary

Introduce fluid, realistic card animations to enhance visual feedback during card gameplay. Cards will animate with arc motion, rotation, and depth effects when played by the player, dealt by the system, and when captured from the table. This feature improves player experience by making game state changes clearly visible and providing satisfying visual feedback.

## Context

### Motivation

Currently, card state changes (plays, deals, captures) happen instantly with no visual transition. This makes it unclear to players what just happened, especially in multiplayer scenarios where attention may be divided. Smooth animations create a more engaging, polished card game experience and help players understand the game flow at a glance.

### Current Limitation

- Card selections have minimal feedback (120ms highlight transition)
- Card plays and deals occur instantly without visual movement
- Opponent card placements and captures show no transition
- No visual distinction between different types of card actions (play vs. capture vs. deal)
- The immutable game state model creates an architectural gap between logical state changes and visual transitions

### Stakeholders

- **Players (single & multiplayer):** Benefit from clearer game state feedback and more engaging gameplay
- **Accessibility users:** Need animations to respect motion preferences and not interfere with keyboard navigation
- **Development team:** Must implement without breaking existing game logic or state management
- **Mobile/tablet users:** Performance must remain smooth on diverse devices

### User Experience Impact

- **Clarity:** Players immediately understand what action just occurred (card played, captured, dealt)
- **Engagement:** Smooth transitions create a more polished, professional feel
- **Feedback:** Visual motion confirms user and system actions in real time
- **Accessibility:** Animations respect prefers-reduced-motion; can be instantly disabled if needed

## High-Level Approach

- **Animation State Layer:** Introduce a separate animation state signal that tracks which cards are currently animating and their progress, independent of game logic state
- **CSS-based Animations:** Use CSS keyframes and transitions for performant 60fps motion on mobile and desktop
- **Card Movement Paths:** Implement arc/bezier curve paths for realistic card motion (hand to table, deck to hand, table to capture pile)
- **Timing Coordination:** Add brief pauses (500–800ms) between major game actions to allow animations to complete and improve clarity
- **Visual Effects:** Apply rotation/flip, glow highlights for captures, special Escoba effects (table clear), and shadow/depth enhancements
- **Accessibility Integration:** Respect prefers-reduced-motion; provide instant animation fallback when requested
- **AI Coordination:** Animate AI opponent plays with the same visual language as player actions for consistency

## Deliverables

1. **Animation state management** – Signal-based tracking of card animation phases
2. **CSS keyframe animations** – Reusable keyframes for card movement, rotation, glow, and disappear effects
3. **Component animation directives** – Angular directives to apply animation triggers and coordinate timing
4. **Game flow integration** – Pause logic between turns to allow animations to complete
5. **Accessibility compliance** – prefers-reduced-motion support with instant fallback
6. **Performance optimization** – GPU-accelerated animations (transform, opacity) for smooth 60fps on mobile
7. **E2E test coverage** – Updated or new Cypress tests to validate animation timing and game flow

## Notes

### Edge Cases

- When Escoba clears the table (all cards captured), all table cards should animate out simultaneously with a special visual effect
- Multiple card selections followed by rapid plays should queue animations cleanly without visual stuttering
- AI turns should include visible animations so players understand the dealer's actions
- Network latency in multiplayer should not cause animations to desynchronize with game state

### Assumptions

- CSS animations and transitions are sufficient for this feature; no third-party animation library (like GSAP) is required initially
- The immutable state pattern will be maintained; animations will be driven by signals that emit animation phase changes
- Game turns naturally have discrete boundaries (selection → confirmation → result), making animation sequencing straightforward
- The current game-table layout (CSS Grid/Flex) is stable and won't require major restructuring for animations

### References

- [Game Engine Core Spec](../game-engine/core/spec.md) – Explicitly excludes UI/animation from scope; animations are pure presentation layer
- [Game Table MVP Spec](./game-table-mvp/spec.md) – Defines table layout and interaction flow that animations will enhance
- [Escobita MVP Summary](../../escoba-mvp-summary.md) – Provides context on game phases and turn flow
