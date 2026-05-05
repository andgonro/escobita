import { Card } from '../../../models/card';

export interface CardVisualAsset {
  assetPath: string;
  semanticLabel: string;
}

function rankToAssetIndex(rank: Card['rank']): string {
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

export function mapCardToVisual(card: Card): CardVisualAsset {
  const rankIndex = rankToAssetIndex(card.rank);

  return {
    assetPath: `/cards/${card.suit}_${rankIndex}.png`,
    semanticLabel: `${card.rank} de ${card.suit}`,
  };
}
