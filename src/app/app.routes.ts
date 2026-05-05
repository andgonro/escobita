import { Routes } from '@angular/router';
import { partidaSessionGuard } from './core/guards/partida-session.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/lobby/lobby/lobby').then((module) => module.Lobby),
  },
  {
    path: 'partida',
    canMatch: [partidaSessionGuard],
    loadComponent: () =>
      import('./features/game-board/game-table-page/game-table-page').then(
        (module) => module.GameTablePage,
      ),
  },
];
