// Covers: FR-9.1, FR-9.2, FR-9.3, FR-9.4, NFR-1.2, US-9
// BDD Scenarios: SC-64, SC-65, SC-66, SC-67, SC-69, SC-70

import { checkWinCondition } from './win-condition.utils';
import { Player } from '../../models/player';

function makePlayer(id: string, name: string): Player {
  return { id, name, hand: [], capturedPile: [], escobaCount: 0 };
}

describe('checkWinCondition', () => {
  it('SC-64 / SC-69 — returns null when no player has reached 15 points', () => {
    const players = [makePlayer('p1', 'Alice'), makePlayer('p2', 'Bob')];
    const scores: Record<string, number> = { p1: 8, p2: 6 };
    expect(checkWinCondition(scores, players)).toBeNull();
  });

  it('SC-64 — returns null when all players are below 15 even if one leads', () => {
    const players = [makePlayer('p1', 'Alice'), makePlayer('p2', 'Bob')];
    const scores: Record<string, number> = { p1: 14, p2: 6 };
    expect(checkWinCondition(scores, players)).toBeNull();
  });

  it('SC-65 / SC-70 — returns the winning player when exactly one player reaches 15 or more', () => {
    const alice = makePlayer('p1', 'Alice');
    const bob = makePlayer('p2', 'Bob');
    const scores: Record<string, number> = { p1: 16, p2: 10 };
    const winner = checkWinCondition(scores, [alice, bob]);
    expect(winner).not.toBeNull();
    expect(winner?.id).toBe('p1');
  });

  it('SC-66 — when multiple players reach 15 simultaneously the player with the highest score wins', () => {
    const alice = makePlayer('p1', 'Alice');
    const bob = makePlayer('p2', 'Bob');
    const scores: Record<string, number> = { p1: 16, p2: 15 };
    const winner = checkWinCondition(scores, [alice, bob]);
    expect(winner?.id).toBe('p1');
  });

  it('SC-67 — returns null when multiple players share the highest score at or above 15 (tie)', () => {
    const alice = makePlayer('p1', 'Alice');
    const bob = makePlayer('p2', 'Bob');
    const scores: Record<string, number> = { p1: 16, p2: 16 };
    expect(checkWinCondition(scores, [alice, bob])).toBeNull();
  });

  it('returns null when three players tie at 15', () => {
    const players = [makePlayer('p1', 'Alice'), makePlayer('p2', 'Bob'), makePlayer('p3', 'Carol')];
    const scores: Record<string, number> = { p1: 15, p2: 15, p3: 15 };
    expect(checkWinCondition(scores, players)).toBeNull();
  });

  it('returns the single highest scorer when others are below 15', () => {
    const alice = makePlayer('p1', 'Alice');
    const bob = makePlayer('p2', 'Bob');
    const carol = makePlayer('p3', 'Carol');
    const scores: Record<string, number> = { p1: 20, p2: 14, p3: 14 };
    const winner = checkWinCondition(scores, [alice, bob, carol]);
    expect(winner?.id).toBe('p1');
  });
});
