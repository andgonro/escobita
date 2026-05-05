import { Component, Input, Signal, signal } from '@angular/core';
import { Player } from '../../../../../models/player';

@Component({
  selector: 'app-opponent-zones',
  imports: [],
  templateUrl: './opponent-zones.html',
  styleUrl: './opponent-zones.scss',
})
export class OpponentZones {
  private readonly opponentsState = signal<Player[]>([]);
  protected readonly opponentsSignal: Signal<Player[]> = this.opponentsState.asReadonly();

  @Input()
  set opponents(players: Player[]) {
    this.opponentsState.set(players ?? []);
  }

  get opponents(): Player[] {
    return this.opponentsState();
  }

  protected seatPosition(index: number): 'north' | 'west' | 'east' {
    const opponentCount = this.opponentsSignal().length;

    if (opponentCount <= 1) {
      return 'north';
    }

    if (opponentCount === 2) {
      return index === 0 ? 'west' : 'east';
    }

    if (index === 0) {
      return 'west';
    }

    if (index === 1) {
      return 'north';
    }

    return 'east';
  }
}
