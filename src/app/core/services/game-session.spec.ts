import { TestBed } from '@angular/core/testing';

import { GameSession } from './game-session';

// Covers: FR-7.5, TR-4.1, TR-4.2, TR-4.3
interface LobbySessionConfig {
  mode: 'Single Player' | 'Multiplayer';
  playerNames: string[];
  playerCount: 2 | 3 | 4;
  aiDifficulty: 'Easy' | 'Medium' | 'Hard';
}

describe('GameSession', () => {
  let service: GameSession;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameSession);
  });

  it('stores the active lobby configuration in a signal', () => {
    const configuration: LobbySessionConfig = {
      mode: 'Single Player',
      playerNames: ['Jugador-1'],
      playerCount: 2,
      aiDifficulty: 'Easy',
    };

    (
      service as unknown as { setConfiguration: (config: LobbySessionConfig) => void }
    ).setConfiguration(configuration);

    expect(
      (service as unknown as { configuration: () => LobbySessionConfig | null }).configuration(),
    ).toEqual(configuration);
  });

  it('exposes null configuration before the first game setup', () => {
    expect(
      (service as unknown as { configuration: () => LobbySessionConfig | null }).configuration(),
    ).toBeNull();
  });
});
