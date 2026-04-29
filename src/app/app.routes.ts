import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/lobby/lobby/lobby').then((module) => module.Lobby),
  },
  {
    path: 'partida',
    loadComponent: () =>
      import('./features/game-board/game-board-placeholder/game-board-placeholder').then(
        (module) => module.GameBoardPlaceholder,
      ),
  },
];
