// T-6: Scoring utilities
// Covers: FR-8.1, FR-8.2, FR-8.3, FR-8.4, TR-3.1, TR-3.2, TR-3.3, NFR-3.1, AD-4, AD-6, US-8

import { Card } from '../../models/card';
import { Player } from '../../models/player';
import { PlayerRoundScore, RoundResult } from '../../models/round-result';

// ---------------------------------------------------------------------------
// Category scorers — independent pure functions (AD-6, NFR-3.1)
// ---------------------------------------------------------------------------

/**
 * Awards 1 point per escoba recorded in the player's escoba count.
 * No tie condition — each player accumulates independently.
 * Covers FR-8.2 (escobas).
 */
export function scoreEscobas(players: Player[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const player of players) {
    result.set(player.id, player.escobaCount);
  }
  return result;
}

/**
 * Awards 1 point to the player with strictly the most captured cards; 2 if they have all 40.
 * Zero points on a tie.
 * Covers FR-8.2 (most-cards).
 */
export function scoreMostCards(players: Player[]): Map<string, number> {
  const counts = players.map((p) => p.capturedPile.length);
  const max = Math.max(...counts);
  const winners = players.filter((p) => p.capturedPile.length === max);

  const result = new Map<string, number>();
  for (const player of players) {
    if (winners.length === 1 && player.id === winners[0].id) {
      result.set(player.id, max === 40 ? 2 : 1);
    } else {
      result.set(player.id, 0);
    }
  }
  return result;
}

/**
 * Awards 1 point to the player with strictly the most Oros cards; 2 if they have all 10.
 * Zero points on a tie.
 * Covers FR-8.2 (most-oros).
 */
export function scoreMostOros(players: Player[]): Map<string, number> {
  const countOros = (p: Player): number => p.capturedPile.filter((c) => c.suit === 'Oros').length;
  const counts = players.map(countOros);
  const max = Math.max(...counts);
  const winners = players.filter((p) => countOros(p) === max);

  const result = new Map<string, number>();
  for (const player of players) {
    if (winners.length === 1 && player.id === winners[0].id) {
      result.set(player.id, max === 10 ? 2 : 1);
    } else {
      result.set(player.id, 0);
    }
  }
  return result;
}

/**
 * Awards 1 point to the player with strictly the most rank-7 cards; 2 if they have all 4.
 * Zero points on a tie.
 * Covers FR-8.2 (most-sevens).
 */
export function scoreMostSevens(players: Player[]): Map<string, number> {
  const countSevens = (p: Player): number => p.capturedPile.filter((c) => c.rank === '7').length;
  const counts = players.map(countSevens);
  const max = Math.max(...counts);
  const winners = players.filter((p) => countSevens(p) === max);

  const result = new Map<string, number>();
  for (const player of players) {
    if (winners.length === 1 && player.id === winners[0].id) {
      result.set(player.id, max === 4 ? 2 : 1);
    } else {
      result.set(player.id, 0);
    }
  }
  return result;
}

/**
 * Awards 1 point to the player who captured the 7 of Oros (Siete de Oros).
 * Independent of most-Oros and most-sevens.
 * Covers FR-8.2 (siete-de-velo).
 */
export function scoreSieteDeVelo(players: Player[]): Map<string, number> {
  const isSieteDeVelo = (c: Card): boolean => c.suit === 'Oros' && c.rank === '7';
  const result = new Map<string, number>();
  for (const player of players) {
    result.set(player.id, player.capturedPile.some(isSieteDeVelo) ? 1 : 0);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Computes the full RoundResult for all players at the end of a round.
 * Orchestrates the five independent scoring category functions.
 * Covers FR-8.1–FR-8.4, TR-3.1, TR-3.2.
 */
export function computeRoundResult(
  players: Player[],
  roundNumber: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _lastCapturerId: string | null, // reserved for future use (e.g. bonus categories)
): RoundResult {
  const escobas = scoreEscobas(players);
  const mostCards = scoreMostCards(players);
  const mostOros = scoreMostOros(players);
  const mostSevens = scoreMostSevens(players);
  const sieteDiVelo = scoreSieteDeVelo(players);

  const playerScores: PlayerRoundScore[] = players.map((player) => {
    const escobasPoints = escobas.get(player.id) ?? 0;
    const mostCardsPoints = mostCards.get(player.id) ?? 0;
    const mostOrosPoints = mostOros.get(player.id) ?? 0;
    const mostSevensPoints = mostSevens.get(player.id) ?? 0;
    const sieteDiVeloPoints = sieteDiVelo.get(player.id) ?? 0;
    const total =
      escobasPoints + mostCardsPoints + mostOrosPoints + mostSevensPoints + sieteDiVeloPoints;

    return {
      playerId: player.id,
      escobas: escobasPoints,
      mostCards: mostCardsPoints,
      mostOros: mostOrosPoints,
      mostSevens: mostSevensPoints,
      sieteDiVelo: sieteDiVeloPoints,
      total,
    };
  });

  return { roundNumber, playerScores };
}
