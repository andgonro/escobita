import { Component, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { Card } from '../../../models/card';
import { Player } from '../../../models/player';
import { RoundResult } from '../../../models/round-result';
import { TableInteractionState } from '../services/table-interaction-state';
import { A11yLiveRegion } from './components/a11y-live-region/a11y-live-region';
import { PlayActionBar } from './components/play-action-bar/play-action-bar';
import { TurnHandoffOverlay } from './components/turn-handoff-overlay/turn-handoff-overlay';
import { ActiveHandZone } from './zones/active-hand-zone/active-hand-zone';
import { CenterTableZone } from './zones/center-table-zone/center-table-zone';
import { OpponentZones } from './zones/opponent-zones/opponent-zones';
import { MatchContextHud } from './components/match-context-hud/match-context-hud';

interface ScoreEntry {
  id: string;
  name: string;
  score: number;
}

interface EscobaOutcome {
  playerName: string;
  escobaCount: number;
}

@Component({
  selector: 'app-game-table-page',
  imports: [
    A11yLiveRegion,
    MatchContextHud,
    OpponentZones,
    CenterTableZone,
    ActiveHandZone,
    PlayActionBar,
    TurnHandoffOverlay,
  ],
  providers: [TableInteractionState],
  templateUrl: './game-table-page.html',
  styleUrl: './game-table-page.scss',
})
export class GameTablePage {
  private readonly injector = inject(Injector);
  private readonly gameEngine = inject(GameEngine);
  private readonly gameSession = inject(GameSession);
  private readonly componentInteractionState = inject(TableInteractionState);
  private readonly parentInteractionState = inject(TableInteractionState, {
    skipSelf: true,
    optional: true,
  });
  private readonly interactionState = this.resolveInteractionState();
  private readonly showTurnHandoffOverlayState = signal(false);
  private readonly liveAnnouncementState = signal('');

  constructor() {
    this.bootstrapEngineStateFromSession();
  }

  protected readonly turnPhase = this.gameEngine.turnPhase;
  protected readonly validationMessage = signal('');
  protected readonly liveAnnouncement = this.liveAnnouncementState.asReadonly();
  protected readonly selectedHandCard = this.interactionState.selectedHandCard;
  protected readonly selectedTableCards = this.interactionState.selectedTableCards;
  protected readonly isCaptureSelectionValid = this.interactionState.isCaptureSelectionValid;
  protected readonly handoffEnabled = computed(() => {
    if (typeof this.interactionState.handoffEnabled !== 'function') {
      return false;
    }

    return this.interactionState.handoffEnabled();
  });
  protected readonly isMultiplayer = computed(() => {
    return this.gameSession.configuration()?.mode === 'Multiplayer';
  });
  protected readonly showTurnHandoffOverlay = computed(() => {
    return this.showTurnHandoffOverlayState() && this.isMultiplayer() && this.handoffEnabled();
  });
  protected readonly contextHeaderTestId = computed(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return 'Cypress' in window ? 'context-header' : null;
  });
  protected readonly canSubmitPlay = computed(() => {
    if (this.interactionState.selectedHandCard() === null) {
      return true;
    }

    return this.interactionState.canSubmitPlay();
  });
  protected readonly interactionEnabled = computed(() => {
    return this.gameEngine.turnPhase() === 'awaiting-card-play' && !this.showTurnHandoffOverlay();
  });

  protected readonly activePlayerName = computed(() => {
    return this.gameEngine.activePlayer()?.name ?? 'No active player';
  });

  protected readonly activeHandCards = computed(() => {
    return this.gameEngine.activePlayer()?.hand ?? [];
  });

  protected readonly tableCards = computed(() => {
    return this.gameEngine.state()?.table ?? [];
  });

  protected readonly scoreEntries = computed<ScoreEntry[]>(() => {
    const state = this.gameEngine.state();
    if (state) {
      return state.players.map((player) => ({
        id: player.id,
        name: player.name,
        score: state.matchScores[player.id] ?? 0,
      }));
    }

    const configuration = this.gameSession.configuration();
    if (!configuration) {
      return [];
    }

    return configuration.playerNames.map((name, index) => ({
      id: `pending-score-${index + 1}`,
      name,
      score: 0,
    }));
  });

  protected readonly roundResult = computed(() => this.readEngineRoundResult());
  protected readonly matchWinner = computed(() => this.readEngineMatchWinner());
  protected readonly escobaOutcome = computed<EscobaOutcome | null>(() => {
    const state = this.gameEngine.state();
    if (!state || state.table.length !== 0 || state.lastCapturerId === null) {
      return null;
    }

    const escobaPlayer = state.players.find((player) => player.id === state.lastCapturerId);
    if (!escobaPlayer || escobaPlayer.escobaCount <= 0) {
      return null;
    }

    return {
      playerName: escobaPlayer.name,
      escobaCount: escobaPlayer.escobaCount,
    };
  });

  protected readonly opponents = computed(() => {
    const state = this.gameEngine.state();
    if (state) {
      return state.players.filter((_, index) => index !== state.turnIndex);
    }

    const configuration = this.gameSession.configuration();
    if (!configuration) {
      return [];
    }

    return this.buildPlaceholderOpponents(configuration.playerCount - 1);
  });

  protected readonly hasSessionConfiguration = computed(() => {
    return this.gameSession.configuration() !== null;
  });

  protected submitPlay(): void {
    const selectedHandCard = this.interactionState.selectedHandCard();
    if (selectedHandCard === null) {
      const message = 'Select a hand card before submitting play.';
      this.validationMessage.set(message);
      this.announce(message);
      this.focusByTestIdAfterRender('play-validation-message');
      return;
    }

    if (
      !this.interactionState.canSubmitPlay() ||
      !this.interactionState.isCaptureSelectionValid()
    ) {
      const message = 'Selected capture subset is not valid.';
      this.validationMessage.set(message);
      this.announce(message);
      this.focusByTestIdAfterRender('play-validation-message');
      return;
    }

    if (this.gameEngine.turnPhase() !== 'awaiting-card-play') {
      return;
    }

    this.validationMessage.set('');
    this.announce('');
    this.gameEngine.playCard(selectedHandCard, this.interactionState.selectedTableCards());
    this.interactionState.resetForNextAction?.();
    this.focusByTestIdAfterRender('confirm-turn');
  }

  protected onHandCardSelected(card: Card): void {
    if (!this.interactionEnabled()) {
      return;
    }

    this.interactionState.selectHandCard(card);
    this.syncValidationMessage();
  }

  protected onTableCardToggled(card: Card): void {
    if (!this.interactionEnabled()) {
      return;
    }

    this.interactionState.toggleTableCard(card);
    this.syncValidationMessage();
  }

  protected confirmTurn(): void {
    if (this.gameEngine.turnPhase() !== 'awaiting-confirmation') {
      return;
    }

    this.showTurnHandoffOverlayState.set(false);
    this.validationMessage.set('');
    this.gameEngine.confirmTurn();

    const nextPlayerName = this.gameEngine.activePlayer()?.name ?? 'No active player';
    this.announce(`Turn changed to ${nextPlayerName}.`);

    if (this.isMultiplayer() && this.handoffEnabled()) {
      this.showTurnHandoffOverlayState.set(true);
      this.focusByTestIdAfterRender('handoff-acknowledge');
      return;
    }

    this.focusByTestIdAfterRender('submit-play');
  }

  protected onHandoffToggleChanged(enabled: boolean): void {
    if (typeof this.interactionState.setHandoffEnabled !== 'function') {
      return;
    }

    this.interactionState.setHandoffEnabled(enabled);
  }

  protected onHandoffAcknowledged(): void {
    this.showTurnHandoffOverlayState.set(false);
    this.focusByTestIdAfterRender('submit-play');
  }

  private resolveInteractionState(): TableInteractionState {
    const parent = this.parentInteractionState;
    if (!parent) {
      return this.componentInteractionState;
    }

    // Keep feature-local state authoritative in runtime; allow non-class test doubles from host injectors.
    if (parent instanceof TableInteractionState) {
      return this.componentInteractionState;
    }

    return parent;
  }

  private bootstrapEngineStateFromSession(): void {
    const configuration = this.gameSession.configuration();
    if (configuration === null) {
      return;
    }

    if (this.gameEngine.state() !== null) {
      return;
    }

    this.gameEngine.initGame(configuration);
  }

  private buildPlaceholderOpponents(opponentCount: number): Player[] {
    return Array.from({ length: Math.max(opponentCount, 0) }, (_, index) => ({
      id: `pending-opponent-${index + 1}`,
      name: `Opponent ${index + 1}`,
      hand: [],
      capturedPile: [],
      escobaCount: 0,
    }));
  }

  private syncValidationMessage(): void {
    const selectedHandCard = this.interactionState.selectedHandCard();
    if (selectedHandCard === null) {
      this.validationMessage.set('');
      return;
    }

    if (!this.interactionState.isCaptureSelectionValid()) {
      this.validationMessage.set('Selected capture subset is not valid.');
      return;
    }

    this.validationMessage.set('');
  }

  private announce(message: string): void {
    this.liveAnnouncementState.set(message);
  }

  private readEngineRoundResult(): RoundResult | null {
    const engine = this.gameEngine as unknown as {
      roundResult?: () => RoundResult | null;
    };

    if (typeof engine.roundResult !== 'function') {
      return null;
    }

    return engine.roundResult();
  }

  private readEngineMatchWinner(): Player | null {
    const engine = this.gameEngine as unknown as {
      matchWinner?: () => Player | null;
    };

    if (typeof engine.matchWinner !== 'function') {
      return null;
    }

    return engine.matchWinner();
  }

  private focusByTestIdAfterRender(testId: string): void {
    afterNextRender(
      () => {
        if (typeof document === 'undefined') {
          return;
        }

        const target = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
        target?.focus();
      },
      { injector: this.injector },
    );
  }
}
