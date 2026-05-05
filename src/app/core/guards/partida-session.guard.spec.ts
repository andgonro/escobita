import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { GameSession } from '../services/game-session';
import { GameConfiguration } from '../../models/game-configuration';
import { partidaSessionGuard } from './partida-session.guard';

// Covers: FR-8.1, TR-1.1, TR-2.1, SEC-02

interface GameSessionPort {
  configuration: () => GameConfiguration | null;
}

const sessionConfiguration: GameConfiguration = {
  mode: 'Single Player',
  playerNames: ['Ana'],
  playerCount: 2,
  aiDifficulty: 'Easy',
};

describe('partidaSessionGuard', () => {
  const runGuard = () => {
    return TestBed.runInInjectionContext(() => partidaSessionGuard({ path: 'partida' }, []));
  };

  it('allows route matching when a session configuration is available', () => {
    const sessionStub: GameSessionPort = {
      configuration: signal<GameConfiguration | null>(sessionConfiguration).asReadonly(),
    };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: GameSession, useValue: sessionStub }],
    });

    expect(runGuard()).toBe(true);
  });

  it('redirects to the lobby route when no session configuration exists', () => {
    const sessionStub: GameSessionPort = {
      configuration: signal<GameConfiguration | null>(null).asReadonly(),
    };

    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: GameSession, useValue: sessionStub }],
    });

    const result = runGuard();
    const router = TestBed.inject(Router);

    expect(result instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(result as UrlTree)).toBe('/');
  });
});
