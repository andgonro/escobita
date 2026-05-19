import { TestBed } from '@angular/core/testing';

import { CardAnimationOrchestrator } from './card-animation-orchestrator';
import {
  type CardAnimationActionType,
  type CardAnimationGroup,
  type CardAnimationState,
} from '../models/animation-contracts';

// Covers: FR-1, FR-2, FR-3, TR-1, TR-8, US-12

describe('CardAnimationOrchestrator', () => {
  let service: CardAnimationOrchestrator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CardAnimationOrchestrator],
    });
    service = TestBed.inject(CardAnimationOrchestrator);
  });

  it('exposes an empty readonly animation state before any group starts', () => {
    const state = service.animationState();

    expect(state).toEqual<CardAnimationState>({
      groups: [],
      activeGroupId: null,
      completedGroupIds: [],
    });
  });

  it.each<CardAnimationActionType>(['play', 'capture', 'deal', 'escoba', 'opponent-play'])(
    'creates a running %s group with per-card participant tracking',
    (actionType) => {
      const groupId = service.startGroup({
        actionType,
        cardIds: ['card-1', 'card-2', 'card-3'],
      });

      const state = service.animationState();
      const group = state.groups.find(
        (currentGroup: CardAnimationGroup) => currentGroup.id === groupId,
      );

      expect(group).toEqual<CardAnimationGroup>({
        id: groupId,
        actionType,
        status: 'running',
        participantCards: [
          { cardId: 'card-1', progress: 0, completed: false },
          { cardId: 'card-2', progress: 0, completed: false },
          { cardId: 'card-3', progress: 0, completed: false },
        ],
      });
      expect(state.activeGroupId).toBe(groupId);
      expect(state.completedGroupIds).toEqual([]);
    },
  );

  it('marks participant completion without finalizing the group until orchestration completes', () => {
    const groupId = service.startGroup({
      actionType: 'capture',
      cardIds: ['table-1', 'table-2'],
    });

    service.completeParticipant(groupId, 'table-1', 100);

    const state = service.animationState();
    const group = state.groups.find(
      (currentGroup: CardAnimationGroup) => currentGroup.id === groupId,
    );
    const completedParticipant = group?.participantCards.find(
      (participant: CardAnimationGroup['participantCards'][number]) =>
        participant.cardId === 'table-1',
    );
    const pendingParticipant = group?.participantCards.find(
      (participant: CardAnimationGroup['participantCards'][number]) =>
        participant.cardId === 'table-2',
    );

    expect(group?.status).toBe('running');
    expect(completedParticipant).toEqual({
      cardId: 'table-1',
      progress: 100,
      completed: true,
    });
    expect(pendingParticipant).toEqual({
      cardId: 'table-2',
      progress: 0,
      completed: false,
    });
    expect(state.completedGroupIds).toEqual([]);
  });

  it('clamps participant progress to the accepted 0-100 contract range', () => {
    const groupId = service.startGroup({
      actionType: 'capture',
      cardIds: ['table-1'],
    });

    service.completeParticipant(groupId, 'table-1', -10);
    service.completeParticipant(groupId, 'table-1', 130);

    const state = service.animationState();
    const group = state.groups.find(
      (currentGroup: CardAnimationGroup) => currentGroup.id === groupId,
    );

    expect(group?.participantCards).toEqual([
      {
        cardId: 'table-1',
        progress: 100,
        completed: true,
      },
    ]);
  });

  it('supports single-card completion accounting before group finalization', () => {
    const groupId = service.startGroup({
      actionType: 'play',
      cardIds: ['hand-1'],
    });

    service.completeParticipant(groupId, 'hand-1', 100);

    const interimState = service.animationState();
    const runningGroup = interimState.groups.find(
      (currentGroup: CardAnimationGroup) => currentGroup.id === groupId,
    );

    expect(runningGroup?.participantCards).toEqual([
      { cardId: 'hand-1', progress: 100, completed: true },
    ]);
    expect(runningGroup?.status).toBe('running');
    expect(interimState.completedGroupIds).toEqual([]);

    service.finalizeGroup(groupId);

    const finalizedState = service.animationState();
    const finalizedGroup = finalizedState.groups.find(
      (currentGroup: CardAnimationGroup) => currentGroup.id === groupId,
    );

    expect(finalizedGroup?.status).toBe('completed');
    expect(finalizedState.completedGroupIds).toEqual([groupId]);
  });

  it('publishes group completion for turn orchestration when a group is finalized', () => {
    const groupId = service.startGroup({
      actionType: 'deal',
      cardIds: ['deck-1', 'deck-2', 'deck-3'],
    });

    service.completeParticipant(groupId, 'deck-1', 100);
    service.completeParticipant(groupId, 'deck-2', 100);
    service.completeParticipant(groupId, 'deck-3', 100);
    service.finalizeGroup(groupId);

    const state = service.animationState();
    const group = state.groups.find(
      (currentGroup: CardAnimationGroup) => currentGroup.id === groupId,
    );

    expect(group?.status).toBe('completed');
    expect(state.activeGroupId).toBeNull();
    expect(state.completedGroupIds).toEqual([groupId]);
    expect(service.lastCompletedGroupId()).toBe(groupId);
  });

  it('ignores finalization attempts for unknown groups without publishing completion state', () => {
    service.finalizeGroup('unknown-group');

    const state = service.animationState();

    expect(state).toEqual<CardAnimationState>({
      groups: [],
      activeGroupId: null,
      completedGroupIds: [],
    });
    expect(service.lastCompletedGroupId()).toBeNull();
  });

  it('preserves canceled lifecycle as a distinct contract state from normal completion flow', () => {
    const groupId = service.startGroup({
      actionType: 'deal',
      cardIds: ['deck-1'],
    });

    service.completeParticipant(groupId, 'deck-1', 100);
    service.finalizeGroup(groupId);

    const state = service.animationState();
    const group = state.groups.find(
      (currentGroup: CardAnimationGroup) => currentGroup.id === groupId,
    );

    expect(group?.status).toBe('completed');
    expect(group?.status).not.toBe('canceled');
  });

  it('ignores participant completion events for unknown cards in existing groups', () => {
    const groupId = service.startGroup({
      actionType: 'play',
      cardIds: ['card-1'],
    });

    service.completeParticipant(groupId, 'missing-card', 100);

    const state = service.animationState();
    const group = state.groups.find(
      (currentGroup: CardAnimationGroup) => currentGroup.id === groupId,
    );

    expect(group?.participantCards).toEqual([{ cardId: 'card-1', progress: 0, completed: false }]);
  });
});
