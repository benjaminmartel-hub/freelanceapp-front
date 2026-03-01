import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirection propre d'un utilisateur non connecté vers la page de login, tout en gardant en mémoire la page qu’il voulait ouvrir.
  return router.createUrlTree(['/auth/login'], {
    queryParams: { redirectUrl: state.url }
  });
};
