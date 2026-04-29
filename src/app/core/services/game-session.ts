import { Injectable, signal } from '@angular/core';
import { GameConfiguration } from '../../models/game-configuration';

@Injectable({
  providedIn: 'root',
})
export class GameSession {
  private readonly _configuration = signal<GameConfiguration | null>(null);

  readonly configuration = this._configuration.asReadonly();

  setConfiguration(configuration: GameConfiguration): void {
    this._configuration.set(configuration);
  }
}
