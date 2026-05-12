import { DOCUMENT } from '@angular/common';
import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { GameSession } from '../../../core/services/game-session';
import { AIDifficulty, GameConfiguration, GameMode } from '../../../models/game-configuration';

interface SinglePlayerModel {
  name: string;
}

interface MultiplayerModel {
  playerNames: [string, string, string, string];
}

@Component({
  selector: 'app-lobby',
  imports: [FormField],
  templateUrl: './lobby.html',
  styleUrl: './lobby.scss',
})
export class Lobby {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly gameSession = inject(GameSession);

  constructor() {
    this.hydrateFromSessionConfiguration();

    afterNextRender(() => {
      const primaryControl = this.document.querySelector('[data-testid="mode-single"]');
      if (primaryControl instanceof HTMLElement) {
        primaryControl.focus();
      }
    });
  }

  protected readonly mode = signal<GameMode>('Single Player');
  protected readonly aiDifficulty = signal<AIDifficulty>('Easy');
  protected readonly multiplayerPlayerCount = signal<2 | 3 | 4>(2);

  private readonly singlePlayerModel = signal<SinglePlayerModel>({
    name: 'Jugador-1',
  });

  protected readonly singlePlayerForm = form(this.singlePlayerModel);

  private readonly multiplayerModel = signal<MultiplayerModel>({
    playerNames: ['Jugador-1', 'Jugador-2', 'Jugador-3', 'Jugador-4'],
  });

  protected readonly multiplayerForm = form(this.multiplayerModel);

  private readonly singleNameBlurred = signal(false);
  private readonly multiplayerNameBlurred = signal<[boolean, boolean, boolean, boolean]>([
    false,
    false,
    false,
    false,
  ]);

  protected readonly isSinglePlayerMode = computed(() => this.mode() === 'Single Player');

  protected readonly visibleMultiplayerIndexes = computed(() =>
    Array.from({ length: this.multiplayerPlayerCount() }, (_, index) => index),
  );

  protected readonly singleNameErrorVisible = computed(
    () =>
      this.isSinglePlayerMode() &&
      this.singleNameBlurred() &&
      this.isBlank(this.singlePlayerForm.name().value()),
  );

  protected readonly isPlayDisabled = computed(() =>
    this.currentPlayerNames().some((name) => this.isBlank(name)),
  );

  protected setMode(nextMode: GameMode): void {
    if (nextMode === this.mode()) {
      return;
    }

    this.mode.set(nextMode);

    if (nextMode === 'Single Player') {
      this.aiDifficulty.set('Easy');
      return;
    }

    this.multiplayerPlayerCount.set(2);
  }

  protected onDifficultyChange(rawValue: string): void {
    if (rawValue === 'Easy' || rawValue === 'Medium' || rawValue === 'Hard') {
      this.aiDifficulty.set(rawValue);
    }
  }

  protected onPlayerCountChange(rawValue: string): void {
    const parsed = Number(rawValue);

    if (parsed === 2 || parsed === 3 || parsed === 4) {
      this.multiplayerPlayerCount.set(parsed);
    }
  }

  protected onSingleNameBlur(): void {
    this.singleNameBlurred.set(true);
  }

  protected onMultiplayerNameBlur(index: number): void {
    this.multiplayerNameBlurred.update((state) => {
      const nextState: [boolean, boolean, boolean, boolean] = [...state];
      nextState[index] = true;

      return nextState;
    });
  }

  protected isMultiplayerNameErrorVisible(index: number): boolean {
    if (this.isSinglePlayerMode() || index >= this.multiplayerPlayerCount()) {
      return false;
    }

    const isBlurred = this.multiplayerNameBlurred()[index];
    const currentValue = this.multiplayerForm.playerNames[index]().value();

    return isBlurred && this.isBlank(currentValue);
  }

  protected startGame(): void {
    if (this.isPlayDisabled()) {
      return;
    }

    const configuration = this.buildConfiguration();
    this.gameSession.setConfiguration(configuration);
    void this.router.navigate(['/partida']);
  }

  private currentPlayerNames(): string[] {
    if (this.isSinglePlayerMode()) {
      return [this.singlePlayerForm.name().value()];
    }

    const playerNames: string[] = [];

    for (let index = 0; index < this.multiplayerPlayerCount(); index += 1) {
      playerNames.push(this.multiplayerForm.playerNames[index]().value());
    }

    return playerNames;
  }

  private buildConfiguration(): GameConfiguration {
    if (this.isSinglePlayerMode()) {
      return {
        mode: 'Single Player',
        playerNames: [this.singlePlayerForm.name().value()],
        playerCount: 2,
        aiDifficulty: this.aiDifficulty(),
      };
    }

    return {
      mode: 'Multiplayer',
      playerNames: this.currentPlayerNames(),
      playerCount: this.multiplayerPlayerCount(),
      aiDifficulty: this.aiDifficulty(),
    };
  }

  private isBlank(value: string): boolean {
    return value.trim().length === 0;
  }

  private hydrateFromSessionConfiguration(): void {
    const configuration = this.gameSession.configuration();
    if (configuration === null) {
      return;
    }

    this.mode.set(configuration.mode);
    this.aiDifficulty.set(configuration.aiDifficulty);
    this.multiplayerPlayerCount.set(configuration.playerCount);

    this.singlePlayerModel.set({
      name: configuration.playerNames[0] ?? this.singlePlayerModel().name,
    });

    this.multiplayerModel.set({
      playerNames: this.buildMultiplayerPrefill(configuration.playerNames),
    });
  }

  private buildMultiplayerPrefill(playerNames: string[]): [string, string, string, string] {
    const fallbackNames = this.multiplayerModel().playerNames;

    return [
      playerNames[0] ?? fallbackNames[0],
      playerNames[1] ?? fallbackNames[1],
      playerNames[2] ?? fallbackNames[2],
      playerNames[3] ?? fallbackNames[3],
    ];
  }
}
