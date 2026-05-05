import { routes } from './app.routes';
import { partidaSessionGuard } from './core/guards/partida-session.guard';
import { GameBoardPlaceholder } from './features/game-board/game-board-placeholder/game-board-placeholder';
import { GameTablePage } from './features/game-board/game-table-page/game-table-page';
import { Lobby } from './features/lobby/lobby/lobby';

// Covers: FR-1.1, FR-1.4, TR-1.1, TR-1.2, TR-1.3

describe('app routes', () => {
  it('registers the lobby at the root path as a lazy-loaded component', async () => {
    const rootRoute = routes.find((route) => route.path === '');

    expect(rootRoute).toBeDefined();
    expect(typeof rootRoute?.loadComponent).toBe('function');

    if (!rootRoute?.loadComponent) {
      throw new Error('Root route must lazy load the lobby component');
    }

    const loaded = await rootRoute.loadComponent();
    expect(loaded).toBe(Lobby);
  });

  it('registers a named game table route', async () => {
    const gameBoardRoute = routes.find((route) => route.path === 'partida');

    expect(gameBoardRoute).toBeDefined();
    expect(typeof gameBoardRoute?.loadComponent).toBe('function');

    if (!gameBoardRoute?.loadComponent) {
      throw new Error('Expected "partida" route to be lazy loaded');
    }

    const loaded = await gameBoardRoute.loadComponent();
    expect(loaded).toBe(GameTablePage);
    expect(loaded).not.toBe(GameBoardPlaceholder);
    expect(gameBoardRoute.canMatch).toBeDefined();
    expect(Array.isArray(gameBoardRoute.canMatch)).toBe(true);
    expect(gameBoardRoute.canMatch).toContain(partidaSessionGuard);
  });
});
