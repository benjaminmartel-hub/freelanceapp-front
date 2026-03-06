import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

// Attache automatiquement le JWT à chaque requête HTTP sortante.
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si pas de token alors la requête est envoyé tel quel
  if (!token) {
    return next(req);
  }

  return next(req.clone({setHeaders: {Authorization: `Bearer ${token}`}}));
};
