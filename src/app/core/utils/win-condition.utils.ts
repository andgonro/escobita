// T-7: Win-condition utility
// Covers: FR-9.1, FR-9.2, FR-9.3, FR-9.4, AD-4

import { Player } from '../../models/player';

const WIN_THRESHOLD = 15;

/**
 * Determines whether a match winner exists after round scores have been applied.
 *
 * Returns the Player with the highest accumulated score if:
 *   - That score is >= WIN_THRESHOLD (15), AND
 *   - No other player shares that exact score.
 *
 * Returns null if no player has reached the threshold, or if two or more players
 * share the highest score at or above the threshold (tie — another round is played).
 *
 * Covers FR-9.1–FR-9.4, US-9.
 */
export function checkWinCondition(
  matchScores: Record<string, number>,
  players: Player[],
): Player | null {
  const qualifiers = players.filter((p) => (matchScores[p.id] ?? 0) >= WIN_THRESHOLD);
  if (qualifiers.length === 0) return null;

  const highScore = Math.max(...qualifiers.map((p) => matchScores[p.id]));
  const leaders = qualifiers.filter((p) => matchScores[p.id] === highScore);

  return leaders.length === 1 ? leaders[0] : null;
}
