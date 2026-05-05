import { Card, Rank, Suit } from '../../../models/card';
import { mapCardToVisual } from './card-asset-mapper';

// Covers: FR-1.5, FR-6.2, TR-3.1, TR-3.2, TR-3.4, TR-6.2, US-1

const suits: Suit[] = ['Oros', 'Copas', 'Espadas', 'Bastos'];
const ranks: Rank[] = ['1', '2', '3', '4', '5', '6', '7', 'Sota', 'Caballo', 'Rey'];

function expectedRankAsset(rank: Rank): string {
  if (rank === 'Sota') {
    return '10';
  }

  if (rank === 'Caballo') {
    return '11';
  }

  if (rank === 'Rey') {
    return '12';
  }

  return rank;
}

describe('mapCardToVisual', () => {
  it('maps numeric cards to deterministic suit/rank asset paths', () => {
    const card: Card = { suit: 'Oros', rank: '1', value: 1 };

    const descriptor = mapCardToVisual(card);

    expect(descriptor.assetPath).toBe('/cards/Oros_1.png');
  });

  it('maps face-card ranks to 10/11/12 asset indexes', () => {
    const sotaCard: Card = { suit: 'Copas', rank: 'Sota', value: 8 };
    const caballoCard: Card = { suit: 'Espadas', rank: 'Caballo', value: 9 };
    const reyCard: Card = { suit: 'Bastos', rank: 'Rey', value: 10 };

    expect(mapCardToVisual(sotaCard).assetPath).toBe('/cards/Copas_10.png');
    expect(mapCardToVisual(caballoCard).assetPath).toBe('/cards/Espadas_11.png');
    expect(mapCardToVisual(reyCard).assetPath).toBe('/cards/Bastos_12.png');
  });

  it('provides a semantic label describing rank and suit', () => {
    const card: Card = { suit: 'Copas', rank: '6', value: 6 };

    const descriptor = mapCardToVisual(card);

    expect(descriptor.semanticLabel).toBe('6 de Copas');
  });

  it('generates a unique deterministic asset path for all 40 suit/rank identities', () => {
    const assetPaths = new Set<string>();

    for (const suit of suits) {
      for (const rank of ranks) {
        const card: Card = {
          suit,
          rank,
          value: Number(expectedRankAsset(rank)),
        };

        assetPaths.add(mapCardToVisual(card).assetPath);
      }
    }

    expect(assetPaths.size).toBe(40);
  });
});
