import { Injectable, Signal, signal } from '@angular/core';
import {
  type CardAnimationGroup,
  type CardAnimationState,
  type StartCardAnimationGroupRequest,
} from '../models/animation-contracts';

const EMPTY_ANIMATION_STATE: CardAnimationState = {
  groups: [],
  activeGroupId: null,
  completedGroupIds: [],
};

@Injectable()
export class CardAnimationOrchestrator {
  private readonly animationStateStore = signal<CardAnimationState>(EMPTY_ANIMATION_STATE);
  private readonly lastCompletedGroupIdStore = signal<string | null>(null);
  private groupSequence = 0;

  readonly animationState: Signal<CardAnimationState> = this.animationStateStore.asReadonly();
  readonly lastCompletedGroupId: Signal<string | null> =
    this.lastCompletedGroupIdStore.asReadonly();

  startGroup(request: StartCardAnimationGroupRequest): string {
    const groupId = this.createGroupId();
    const nextGroup: CardAnimationGroup = {
      id: groupId,
      actionType: request.actionType,
      status: 'running',
      participantCards: request.cardIds.map((cardId) => ({
        cardId,
        progress: 0,
        completed: false,
      })),
    };

    this.animationStateStore.update((state) => ({
      ...state,
      groups: [...state.groups, nextGroup],
      activeGroupId: groupId,
    }));

    return groupId;
  }

  completeParticipant(groupId: string, cardId: string, progress: number): void {
    const clampedProgress = Math.max(0, Math.min(100, progress));

    this.animationStateStore.update((state) => ({
      ...state,
      groups: state.groups.map((group) => {
        if (group.id !== groupId || group.status !== 'running') {
          return group;
        }

        return {
          ...group,
          participantCards: group.participantCards.map((participant) => {
            if (participant.cardId !== cardId) {
              return participant;
            }

            return {
              ...participant,
              progress: clampedProgress,
              completed: clampedProgress >= 100,
            };
          }),
        };
      }),
    }));
  }

  finalizeGroup(groupId: string): void {
    let finalized = false;

    this.animationStateStore.update((state) => {
      const targetGroup = state.groups.find((group) => group.id === groupId);
      if (!targetGroup || targetGroup.status === 'canceled') {
        return state;
      }

      finalized = true;

      const nextCompletedGroupIds = state.completedGroupIds.includes(groupId)
        ? state.completedGroupIds
        : [...state.completedGroupIds, groupId];

      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          return {
            ...group,
            status: 'completed',
          };
        }),
        activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
        completedGroupIds: nextCompletedGroupIds,
      };
    });

    if (finalized) {
      this.lastCompletedGroupIdStore.set(groupId);
    }
  }

  cancelGroup(groupId: string): void {
    this.animationStateStore.update((state) => {
      const targetGroup = state.groups.find((group) => group.id === groupId);
      if (!targetGroup || targetGroup.status !== 'running') {
        return state;
      }

      return {
        ...state,
        groups: state.groups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          return {
            ...group,
            status: 'canceled',
          };
        }),
        activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId,
      };
    });
  }

  private createGroupId(): string {
    this.groupSequence += 1;
    return `animation-group-${this.groupSequence}`;
  }
}
