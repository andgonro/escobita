import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { GameSession } from '../services/game-session';

export const partidaSessionGuard: CanMatchFn = () => {
  const gameSession = inject(GameSession);
  const router = inject(Router);

  return gameSession.configuration() ? true : router.createUrlTree(['/']);
};
