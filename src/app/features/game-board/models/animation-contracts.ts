import { Card } from '../../../models/card';

export type CardAnimationActionType = 'play' | 'capture' | 'deal' | 'escoba' | 'opponent-play';

export type CardAnimationGroupStatus = 'running' | 'completed' | 'canceled';

export type CardAnimationVisualState =
  | 'idle'
  | 'play'
  | 'capture'
  | 'deal'
  | 'opponent'
  | 'escoba'
  | null;

export interface CardAnimationParticipant {
  cardId: string;
  progress: number;
  completed: boolean;
}

export interface CardAnimationGroup {
  id: string;
  actionType: CardAnimationActionType;
  status: CardAnimationGroupStatus;
  participantCards: CardAnimationParticipant[];
}

export interface CardAnimationState {
  groups: CardAnimationGroup[];
  activeGroupId: string | null;
  completedGroupIds: string[];
}

export interface StartCardAnimationGroupRequest {
  actionType: CardAnimationActionType;
  cardIds: string[];
}

export interface HandCardAnimationMetadata {
  card: Card;
  animationState: CardAnimationVisualState;
}

export interface TableCardAnimationMetadata {
  card: Card;
  animationState: CardAnimationVisualState;
}

export interface OpponentCardAnimationMetadata {
  cardIndex: number;
  animationState: CardAnimationVisualState;
}

export interface ActiveHandZoneAnimationMetadata {
  hand: HandCardAnimationMetadata[];
}

export interface CenterTableZoneAnimationMetadata {
  table: TableCardAnimationMetadata[];
}

export interface OpponentZonesAnimationMetadata {
  opponent: OpponentCardAnimationMetadata[];
}
