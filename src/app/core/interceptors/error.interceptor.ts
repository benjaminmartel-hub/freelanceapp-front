import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        toastService.error(resolveHttpErrorMessage(error));
      } else {
        toastService.error('Une erreur inattendue est survenue.');
      }

      return throwError(() => error);
    })
  );
};

function resolveHttpErrorMessage(error: HttpErrorResponse): string {
  const payloadMessage = extractMessageFromPayload(error.error);

  if (payloadMessage) {
    return payloadMessage;
  }

  if (error.status === 401) {
    return "Nom d'utilisateur ou mot de passe invalide.";
  }

  if (error.status === 403) {
    return "Vous n'avez pas les droits pour effectuer cette action.";
  }

  if (error.status === 0) {
    return 'Serveur injoignable. Verifiez que le backend est demarre.';
  }

  // Angular signale ce cas quand il attend du JSON mais recoit HTML/texte.
  // Typiquement, un backend qui redirige vers /login (page HTML) au lieu de renvoyer une erreur API JSON.
  if (error.status === 200 && error.message.includes('Http failure during parsing')) {
    if (isAuthRequest(error.url)) {
      return "Echec de connexion: nom d'utilisateur ou mot de passe invalide.";
    }

    return 'Reponse serveur invalide (format inattendu).';
  }

  return `Erreur ${error.status}: ${error.message}`;
}

function extractMessageFromPayload(payload: unknown): string | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    const trimmedPayload = payload.trim();
    if (!trimmedPayload) {
      return null;
    }

    if (trimmedPayload.startsWith('<!DOCTYPE') || trimmedPayload.startsWith('<html')) {
      return null;
    }

    try {
      const parsed = JSON.parse(trimmedPayload) as unknown;
      return extractMessageFromPayload(parsed);
    } catch {
      return trimmedPayload;
    }
  }

  if (typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;
    const fields = ['message', 'error', 'detail', 'title'] as const;

    for (const field of fields) {
      const value = candidate[field];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }

  return null;
}

function isAuthRequest(url: string | null): boolean {
  if (!url) {
    return false;
  }

  return url.includes('/auth/login') || url.endsWith('/login') || url.includes('/auth/register');
}
