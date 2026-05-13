import { Injectable } from '@angular/core';
import { GameState } from '../../models/game-state';
import { AIDifficulty } from '../../models/game-configuration';
import { Player } from '../../models/player';
import { AiPlayDecision } from '../../models/ai-turn';
import { Card } from '../../models/card';
import {
  scoreEscobas,
  scoreMostCards,
  scoreMostOros,
  scoreMostSevens,
  scoreSieteDeVelo,
} from '../utils/scoring.utils';
import { createDeck } from '../utils/deck.utils';

export type RandomFn = (maxExclusive: number) => number;

@Injectable({
  providedIn: 'root',
})
export class AiStrategyService {
  decide(
    state: GameState,
    aiPlayer: Player,
    difficulty: AIDifficulty,
    randomFn?: RandomFn,
  ): AiPlayDecision {
    const pickRandom = randomFn ?? this.secureRandomIndex;

    if (difficulty === 'Easy') {
      return this.decideFacil(state, aiPlayer, pickRandom);
    }

    if (difficulty === 'Medium') {
      return this.decideIntermedio(state, aiPlayer, pickRandom);
    }

    return this.decideDificil(state, aiPlayer, pickRandom);
  }

  private decideFacil(state: GameState, aiPlayer: Player, randomFn: RandomFn): AiPlayDecision {
    const captureOptions = this.getCaptureOptions(aiPlayer.hand, state.table);
    const escobaOptions = this.getEscobaOptions(captureOptions, state.table);

    if (escobaOptions.length > 0) {
      return this.pickOption(escobaOptions, randomFn);
    }

    if (captureOptions.length > 0) {
      return this.pickOption(captureOptions, randomFn);
    }

    return this.decidePlacement(aiPlayer.hand, randomFn);
  }

  private decideIntermedio(state: GameState, aiPlayer: Player, randomFn: RandomFn): AiPlayDecision {
    const captureOptions = this.getCaptureOptions(aiPlayer.hand, state.table);
    const escobaOptions = this.getEscobaOptions(captureOptions, state.table);

    if (escobaOptions.length > 0) {
      return this.pickOption(escobaOptions, randomFn);
    }

    if (captureOptions.length > 0) {
      const highestScore = Math.max(
        ...captureOptions.map((option) => this.getHighValueCaptureScore(option.captureSubset)),
      );
      const bestOptions = captureOptions.filter(
        (option) => this.getHighValueCaptureScore(option.captureSubset) === highestScore,
      );

      return this.pickOption(bestOptions, randomFn);
    }

    return this.decidePlacement(aiPlayer.hand, randomFn);
  }

  private decideDificil(state: GameState, aiPlayer: Player, randomFn: RandomFn): AiPlayDecision {
    const captureOptions = this.getCaptureOptions(aiPlayer.hand, state.table);
    const escobaOptions = this.getEscobaOptions(captureOptions, state.table);

    if (escobaOptions.length > 0) {
      return this.pickOption(escobaOptions, randomFn);
    }

    if (captureOptions.length > 0) {
      const allCapturedCards = state.players.flatMap((player) => player.capturedPile);
      const unseenCards = this.buildUnseenCards(aiPlayer.hand, state.table, allCapturedCards);
      const opponents = state.players.filter((player) => player.id !== aiPlayer.id);

      const optionScores = captureOptions.map((option) => ({
        option,
        projectedScore: this.getProjectedRoundScore(aiPlayer, opponents, option.captureSubset),
        probabilityScore: this.getProbabilityWeightedScore(option.captureSubset, unseenCards),
      }));

      const highestProjected = Math.max(...optionScores.map((entry) => entry.projectedScore));
      const bestProjected = optionScores.filter(
        (entry) => entry.projectedScore === highestProjected,
      );

      const largestCapture = Math.max(
        ...bestProjected.map((entry) => entry.option.captureSubset.length),
      );
      const bestByCaptureSize = bestProjected.filter(
        (entry) => entry.option.captureSubset.length === largestCapture,
      );

      const highestProbability = Math.max(
        ...bestByCaptureSize.map((entry) => entry.probabilityScore),
      );
      const bestOptions = bestByCaptureSize
        .filter((entry) => entry.probabilityScore === highestProbability)
        .map((entry) => entry.option);

      return this.pickOption(bestOptions, randomFn);
    }

    return this.decidePlacement(aiPlayer.hand, randomFn);
  }

  private decidePlacement(hand: Card[], randomFn: RandomFn): AiPlayDecision {
    const cardToPlay = this.pickOption(hand, randomFn);

    if (!cardToPlay) {
      throw new Error('AiStrategyService requires at least one card in hand to decide.');
    }

    return {
      cardToPlay,
      captureSubset: [],
    };
  }

  private getCaptureOptions(hand: Card[], table: Card[]): AiPlayDecision[] {
    const captureSubsets = this.getNonEmptySubsets(table);
    const options: AiPlayDecision[] = [];

    for (const handCard of hand) {
      for (const subset of captureSubsets) {
        const subsetTotal = subset.reduce((sum, tableCard) => sum + tableCard.value, 0);
        if (subsetTotal + handCard.value === 15) {
          options.push({
            cardToPlay: handCard,
            captureSubset: subset,
          });
        }
      }
    }

    return options;
  }

  private getNonEmptySubsets(cards: Card[]): Card[][] {
    const subsets: Card[][] = [];
    const maxMask = 1 << cards.length;

    for (let mask = 1; mask < maxMask; mask++) {
      const subset: Card[] = [];
      for (let index = 0; index < cards.length; index++) {
        if ((mask & (1 << index)) !== 0) {
          subset.push(cards[index]);
        }
      }
      subsets.push(subset);
    }

    return subsets;
  }

  private getEscobaOptions(options: AiPlayDecision[], table: Card[]): AiPlayDecision[] {
    return options.filter((option) => option.captureSubset.length === table.length);
  }

  private getHighValueCaptureScore(captureSubset: Card[]): number {
    return captureSubset.reduce((score, capturedCard) => {
      const isHighValue = capturedCard.suit === 'Oros' || capturedCard.rank === '7';
      return score + (isHighValue ? 1 : 0);
    }, 0);
  }

  private getProjectedRoundScore(
    aiPlayer: Player,
    opponents: Player[],
    captureSubset: Card[],
  ): number {
    const projectedAi: Player = {
      id: aiPlayer.id,
      name: aiPlayer.name,
      hand: [],
      capturedPile: [...aiPlayer.capturedPile, ...captureSubset],
      escobaCount: aiPlayer.escobaCount,
    };
    const projectedOpponents: Player[] = opponents.map((opponent) => ({
      id: opponent.id,
      name: opponent.name,
      hand: [],
      capturedPile: [...opponent.capturedPile],
      escobaCount: opponent.escobaCount,
    }));
    const projectedPlayers = [projectedAi, ...projectedOpponents];

    const playerId = projectedAi.id;
    const escobas = scoreEscobas(projectedPlayers).get(playerId) ?? 0;
    const mostCards = scoreMostCards(projectedPlayers).get(playerId) ?? 0;
    const mostOros = scoreMostOros(projectedPlayers).get(playerId) ?? 0;
    const mostSevens = scoreMostSevens(projectedPlayers).get(playerId) ?? 0;
    const sieteDeVelo = scoreSieteDeVelo(projectedPlayers).get(playerId) ?? 0;

    return escobas + mostCards + mostOros + mostSevens + sieteDeVelo;
  }

  private getProbabilityWeightedScore(captureSubset: Card[], unseenCards: Card[]): number {
    const unseenHighValue = unseenCards.filter(
      (card) => card.suit === 'Oros' || card.rank === '7',
    ).length;
    const capturedHighValue = this.getHighValueCaptureScore(captureSubset);
    const remainingCards = Math.max(unseenCards.length - captureSubset.length, 0);

    // Higher current high-value capture and lower remaining uncertainty imply stronger expected value.
    return (
      capturedHighValue * 100 + captureSubset.length * 10 + (unseenHighValue - remainingCards / 2)
    );
  }

  private buildCardKey(card: Card): string {
    return `${card.suit}-${card.rank}`;
  }

  private buildUnseenCards(aiHand: Card[], table: Card[], capturedCards: Card[]): Card[] {
    const knownCards = [...aiHand, ...table, ...capturedCards];
    const knownCounts = new Map<string, number>();

    for (const knownCard of knownCards) {
      const key = this.buildCardKey(knownCard);
      knownCounts.set(key, (knownCounts.get(key) ?? 0) + 1);
    }

    const unseen: Card[] = [];
    for (const deckCard of createDeck()) {
      const key = this.buildCardKey(deckCard);
      const remainingKnown = knownCounts.get(key) ?? 0;
      if (remainingKnown > 0) {
        knownCounts.set(key, remainingKnown - 1);
      } else {
        unseen.push(deckCard);
      }
    }

    return unseen;
  }

  private pickOption<T>(items: T[], randomFn: RandomFn): T {
    const rawIndex = randomFn(items.length);
    const safeIndex = Math.min(Math.max(rawIndex, 0), items.length - 1);
    return items[safeIndex];
  }

  private readonly secureRandomIndex: RandomFn = (maxExclusive: number): number => {
    if (maxExclusive <= 1) {
      return 0;
    }

    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.getRandomValues) {
      const values = new Uint32Array(1);
      cryptoApi.getRandomValues(values);
      return values[0] % maxExclusive;
    }

    return Math.floor(Math.random() * maxExclusive);
  };
}
